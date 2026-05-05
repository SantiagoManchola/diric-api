import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/errorHandler";
import { uploadToR2, deleteFromR2 } from "../../lib/r2";
import { generateEventPDF } from "../../lib/pdf";
import type { RoleName, AttendanceStatus } from "@prisma/client";

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  active: true,
  created_at: true,
};

const eventInclude = {
  project: true,
  creator: { select: { id: true, name: true, email: true, phone: true } },
  encargado: { select: { id: true, name: true, email: true, phone: true } },
  attendees: { include: { user: { select: safeUserSelect } } },
  images: { orderBy: { order_idx: "asc" as const } },
  pdf_versions: { orderBy: { version: "asc" as const } },
};

// ── PDF helpers ───────────────────────────────────────────────────────────────

async function generateAndStorePdf(eventId: number): Promise<void> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: eventInclude,
  });
  if (!event) return;

  const pdfBuffer = await generateEventPDF(event as any);

  const versionCount = await prisma.eventPdfVersion.count({
    where: { event_id: eventId },
  });
  const version = versionCount + 1;

  const key = `events/${eventId}/pdfs/v${version}-${Date.now()}.pdf`;
  const url = await uploadToR2(key, pdfBuffer, "application/pdf");

  await prisma.eventPdfVersion.create({
    data: { event_id: eventId, version, r2_key: key, url },
  });
}

// ── Events CRUD ───────────────────────────────────────────────────────────────

export async function getAll(
  search?: string,
  callerRole?: RoleName,
  callerUserId?: number,
) {
  const where: any = {};

  if (callerRole === "profesor" && callerUserId) {
    where.OR = [
      { created_by: callerUserId },
      { encargado_id: callerUserId },
      { attendees: { some: { user_id: callerUserId } } },
    ];
  }

  if (callerRole === "academicUnit" && callerUserId) {
    const profAUs = await prisma.professorAcademicUnit.findMany({
      where: { academic_unit_id: callerUserId },
      select: { professor_id: true },
    });
    const profIds = profAUs.map((pa) => pa.professor_id);
    const assignments = await prisma.projectAssignment.findMany({
      where: { user_id: { in: profIds } },
      select: { project_id: true },
    });
    const projectIds = [...new Set(assignments.map((a) => a.project_id))];
    where.project_id = { in: projectIds };
  }

  if (search) {
    const searchConditions = [
      { title: { contains: search, mode: "insensitive" as const } },
      { description: { contains: search, mode: "insensitive" as const } },
    ];
    if (where.OR) {
      where.AND = [{ OR: where.OR }, { OR: searchConditions }];
      delete where.OR;
    } else {
      where.OR = searchConditions;
    }
  }

  const [data, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { start_datetime: "desc" },
      include: {
        images: { orderBy: { order_idx: "asc" } },
        pdf_versions: { orderBy: { version: "desc" }, take: 1 },
      },
    }),
    prisma.event.count({ where }),
  ]);

  return { data, total };
}

export async function getById(id: number) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: eventInclude,
  });
  if (!event) throw new AppError(404, "Evento no encontrado");
  return event;
}

export async function create(data: any, callerUserId: number) {
  const project = await prisma.project.findUnique({
    where: { id: data.project_id },
  });
  if (!project) throw new AppError(404, "Proyecto no encontrado");

  const event = await prisma.event.create({
    data: {
      ...data,
      start_datetime: new Date(data.start_datetime),
      end_datetime: new Date(data.end_datetime),
      created_by: callerUserId,
    },
  });

  // Auto-generate PDF in background (don't fail if PDF fails)
  generateAndStorePdf(event.id).catch((err) =>
    console.error(`[PDF] Error al generar PDF para evento ${event.id}:`, err),
  );

  return event;
}

export async function update(id: number, data: any) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new AppError(404, "Evento no encontrado");

  const updateData = { ...data };
  if (data.start_datetime)
    updateData.start_datetime = new Date(data.start_datetime);
  if (data.end_datetime) updateData.end_datetime = new Date(data.end_datetime);

  const updated = await prisma.event.update({
    where: { id },
    data: updateData,
  });

  // Auto-generate new PDF version
  generateAndStorePdf(id).catch((err) =>
    console.error(`[PDF] Error al generar PDF para evento ${id}:`, err),
  );

  return updated;
}

export async function remove(id: number) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      images: true,
      pdf_versions: true,
    },
  });
  if (!event) throw new AppError(404, "Evento no encontrado");

  // Delete all R2 assets
  const r2Deletions = [
    ...event.images.map((img) => deleteFromR2(img.r2_key)),
    ...event.pdf_versions.map((pdf) => deleteFromR2(pdf.r2_key)),
  ];
  await Promise.allSettled(r2Deletions);

  await prisma.event.delete({ where: { id } });
  return { success: true };
}

// ── Attendees ─────────────────────────────────────────────────────────────────

export async function addAttendee(
  eventId: number,
  data: { user_id: number; status: AttendanceStatus; note: string },
) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError(404, "Evento no encontrado");

  return prisma.eventAttendee.create({
    data: {
      event_id: eventId,
      user_id: data.user_id,
      status: data.status,
      note: data.note,
    },
  });
}

export async function updateAttendee(
  attendeeId: number,
  status: AttendanceStatus,
  note: string,
) {
  try {
    return await prisma.eventAttendee.update({
      where: { id: attendeeId },
      data: { status, note },
    });
  } catch {
    throw new AppError(404, "Asistente no encontrado");
  }
}

export async function removeAttendee(attendeeId: number) {
  try {
    await prisma.eventAttendee.delete({ where: { id: attendeeId } });
    return { success: true };
  } catch {
    throw new AppError(404, "Asistente no encontrado");
  }
}

// ── Images ────────────────────────────────────────────────────────────────────

export async function uploadImages(
  eventId: number,
  files: Express.Multer.File[],
) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError(404, "Evento no encontrado");

  const currentCount = await prisma.eventImage.count({
    where: { event_id: eventId },
  });

  const saved = await Promise.all(
    files.map(async (file, idx) => {
      const ext = file.mimetype === "image/png" ? "png" : "jpg";
      const key = `events/${eventId}/images/${Date.now()}-${idx}.${ext}`;
      const url = await uploadToR2(key, file.buffer, file.mimetype);

      return prisma.eventImage.create({
        data: {
          event_id: eventId,
          r2_key: key,
          url,
          filename: file.originalname,
          mime_type: file.mimetype,
          order_idx: currentCount + idx,
        },
      });
    }),
  );

  // Regenerate PDF with the new images
  generateAndStorePdf(eventId).catch((err) =>
    console.error(`[PDF] Error al regenerar PDF para evento ${eventId}:`, err),
  );

  return saved;
}

export async function deleteImage(eventId: number, imageId: number) {
  const image = await prisma.eventImage.findFirst({
    where: { id: imageId, event_id: eventId },
  });
  if (!image) throw new AppError(404, "Imagen no encontrada");

  await deleteFromR2(image.r2_key);
  await prisma.eventImage.delete({ where: { id: imageId } });

  // Regenerate PDF without this image
  generateAndStorePdf(eventId).catch((err) =>
    console.error(`[PDF] Error al regenerar PDF para evento ${eventId}:`, err),
  );

  return { success: true };
}

export async function getImages(eventId: number) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError(404, "Evento no encontrado");

  return prisma.eventImage.findMany({
    where: { event_id: eventId },
    orderBy: { order_idx: "asc" },
  });
}

// ── PDF history ───────────────────────────────────────────────────────────────

export async function getPdfVersions(eventId: number) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError(404, "Evento no encontrado");

  return prisma.eventPdfVersion.findMany({
    where: { event_id: eventId },
    orderBy: { version: "desc" },
  });
}

export async function getLatestPdf(eventId: number) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError(404, "Evento no encontrado");

  const pdf = await prisma.eventPdfVersion.findFirst({
    where: { event_id: eventId },
    orderBy: { version: "desc" },
  });

  if (!pdf) throw new AppError(404, "Aún no hay PDF generado para este evento");
  return pdf;
}

export async function regeneratePdf(eventId: number) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError(404, "Evento no encontrado");

  await generateAndStorePdf(eventId);

  return prisma.eventPdfVersion.findFirst({
    where: { event_id: eventId },
    orderBy: { version: "desc" },
  });
}
