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

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: {
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                user_roles: {
                  select: { role: { select: { name: true } } },
                },
              },
            },
          },
        },
      },
    }),
    prisma.project.count({ where }),
  ]);

  const data = projects.map((p) => {
    const academic_units = p.assignments
      .filter((a) =>
        a.user.user_roles.some((ur) => ur.role.name === "academicUnit"),
      )
      .map((a) => ({ id: a.user.id, name: a.user.name }));
    const { assignments: _, ...rest } = p;
    return { ...rest, academic_units };
  });

  return { data, total };
}

export async function getById(id: number) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      country: true,
      assignments: {
        include: {
          user: {
            select: {
              ...safeUserSelect,
              user_roles: {
                select: { role: { select: { name: true } } },
              },
            },
          },
        },
      },
      events: true,
    },
  });

  if (!project) throw new AppError(404, "Proyecto no encontrado");

  const academic_units = project.assignments
    .filter((a) =>
      a.user.user_roles.some((ur) => ur.role.name === "academicUnit"),
    )
    .map((a) => ({ id: a.user.id, name: a.user.name }));

  return { ...project, academic_units };
}

export async function create(data: {
  country_id: number;
  title: string;
  description: string;
  status: string;
  start_date: string;
  deadline: string;
  end_date?: string | null;
  academic_unit_ids?: number[];
}) {
  const { academic_unit_ids, ...projectData } = data;

  const country = await prisma.country.findUnique({
    where: { id: projectData.country_id },
  });
  if (!country) throw new AppError(404, "Pais no encontrado");

  const project = await prisma.project.create({ data: projectData });

  if (academic_unit_ids?.length) {
    await prisma.projectAssignment.createMany({
      data: academic_unit_ids.map((user_id) => ({
        project_id: project.id,
        user_id,
        role_in_project: "unidad_academica",
      })),
    });
  }

  return project;
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

  const { academic_unit_ids, ...projectData } = data;

  const updated = await prisma.project.update({
    where: { id },
    data: projectData,
  });

  if (academic_unit_ids !== undefined) {
    const existingAUAssignments = await prisma.projectAssignment.findMany({
      where: {
        project_id: id,
        user: { user_roles: { some: { role: { name: "academicUnit" } } } },
      },
      select: { id: true },
    });
    await prisma.projectAssignment.deleteMany({
      where: { id: { in: existingAUAssignments.map((a) => a.id) } },
    });
    if (academic_unit_ids.length) {
      await prisma.projectAssignment.createMany({
        data: academic_unit_ids.map((user_id: number) => ({
          project_id: id,
          user_id,
          role_in_project: "unidad_academica",
        })),
      });
    }
  }

  return updated;
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

// Stats
export async function getByAcademicUnit() {
  const academicUnits = await prisma.user.findMany({
    where: {
      user_roles: { some: { role: { name: "academicUnit" } } },
      active: true,
    },
    select: {
      id: true,
      name: true,
      academic_unit_professors: {
        select: {
          professor: {
            select: {
              project_assignments: {
                select: { project_id: true },
              },
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return academicUnits.map((au) => {
    const projectIds = new Set<number>();
    for (const pau of au.academic_unit_professors) {
      for (const assignment of pau.professor.project_assignments) {
        projectIds.add(assignment.project_id);
      }
    }
    return {
      academic_unit_id: au.id,
      academic_unit_name: au.name,
      project_count: projectIds.size,
    };
  });
}
