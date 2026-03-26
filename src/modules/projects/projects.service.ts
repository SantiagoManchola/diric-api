import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/errorHandler";
import type { RoleName } from "@prisma/client";

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

  // Professor only sees projects they are assigned to
  if (callerRole === "profesor" && callerUserId) {
    where.assignments = { some: { user_id: callerUserId } };
  }

  // Academic unit sees projects with professors from their unit
  if (callerRole === "academicUnit" && callerUserId) {
    const profAUs = await prisma.professorAcademicUnit.findMany({
      where: { academic_unit_id: callerUserId },
      select: { professor_id: true },
    });
    const profIds = profAUs.map((pa) => pa.professor_id);
    where.assignments = { some: { user_id: { in: profIds } } };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.project.findMany({ where, orderBy: { created_at: "desc" } }),
    prisma.project.count({ where }),
  ]);

  return { data, total };
}

export async function getById(id: number) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      country: true,
      assignments: { include: { user: { select: safeUserSelect } } },
      events: true,
    },
  });

  if (!project) throw new AppError(404, "Proyecto no encontrado");
  return project;
}

export async function create(data: {
  country_id: number;
  title: string;
  description: string;
  status: string;
  start_date: string;
  deadline: string;
  end_date?: string | null;
}) {
  const country = await prisma.country.findUnique({
    where: { id: data.country_id },
  });
  if (!country) throw new AppError(404, "Pais no encontrado");

  return prisma.project.create({ data });
}

export async function update(id: number, data: any) {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new AppError(404, "Proyecto no encontrado");

  if (data.country_id) {
    const country = await prisma.country.findUnique({
      where: { id: data.country_id },
    });
    if (!country) throw new AppError(404, "Pais no encontrado");
  }

  return prisma.project.update({ where: { id }, data });
}

export async function remove(id: number) {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new AppError(404, "Proyecto no encontrado");

  await prisma.project.delete({ where: { id } });
  return { success: true };
}

// Assignments
export async function addAssignment(
  projectId: number,
  data: { user_id: number; role_in_project: string },
) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new AppError(404, "Proyecto no encontrado");

  return prisma.projectAssignment.create({
    data: {
      project_id: projectId,
      user_id: data.user_id,
      role_in_project: data.role_in_project,
    },
  });
}

export async function removeAssignment(assignmentId: number) {
  try {
    await prisma.projectAssignment.delete({ where: { id: assignmentId } });
    return { success: true };
  } catch {
    throw new AppError(404, "Asignacion no encontrada");
  }
}
