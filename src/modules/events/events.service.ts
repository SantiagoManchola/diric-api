import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/errorHandler";
import type { RoleName, AttendanceStatus } from "@prisma/client";

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  active: true,
  created_at: true,
};

export async function getAll(
  search?: string,
  callerRole?: RoleName,
  callerUserId?: number,
) {
  const where: any = {};

  // Professor only sees events where they are creator, encargado, or attendee
  if (callerRole === "profesor" && callerUserId) {
    where.OR = [
      { created_by: callerUserId },
      { encargado_id: callerUserId },
      { attendees: { some: { user_id: callerUserId } } },
    ];
  }

  // Academic unit sees events of projects from their professors
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
      // Combine with existing OR (professor filter)
      where.AND = [{ OR: where.OR }, { OR: searchConditions }];
      delete where.OR;
    } else {
      where.OR = searchConditions;
    }
  }

  const [data, total] = await Promise.all([
    prisma.event.findMany({ where, orderBy: { start_datetime: "desc" } }),
    prisma.event.count({ where }),
  ]);

  return { data, total };
}

export async function getById(id: number) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      project: true,
      creator: { select: safeUserSelect },
      encargado: { select: safeUserSelect },
      attendees: { include: { user: { select: safeUserSelect } } },
    },
  });

  if (!event) throw new AppError(404, "Evento no encontrado");
  return event;
}

export async function create(data: any, callerUserId: number) {
  const project = await prisma.project.findUnique({
    where: { id: data.project_id },
  });
  if (!project) throw new AppError(404, "Proyecto no encontrado");

  return prisma.event.create({
    data: {
      ...data,
      start_datetime: new Date(data.start_datetime),
      end_datetime: new Date(data.end_datetime),
      created_by: callerUserId,
    },
  });
}

export async function update(id: number, data: any) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new AppError(404, "Evento no encontrado");

  const updateData = { ...data };
  if (data.start_datetime)
    updateData.start_datetime = new Date(data.start_datetime);
  if (data.end_datetime) updateData.end_datetime = new Date(data.end_datetime);

  return prisma.event.update({ where: { id }, data: updateData });
}

export async function remove(id: number) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new AppError(404, "Evento no encontrado");

  await prisma.event.delete({ where: { id } });
  return { success: true };
}

// Attendees
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
