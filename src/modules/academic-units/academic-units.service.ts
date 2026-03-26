import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/errorHandler";

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  active: true,
  created_at: true,
  user_roles: { include: { role: true } },
};

function formatUser(user: any) {
  const { user_roles, ...rest } = user;
  return { ...rest, roles: user_roles.map((ur: any) => ur.role) };
}

export async function getAll(search?: string) {
  const role = await prisma.role.findUnique({
    where: { name: "academicUnit" },
  });
  if (!role) return { data: [], total: 0 };

  const where: any = {
    user_roles: { some: { role_id: role.id } },
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: userSelect,
      orderBy: { name: "asc" },
    }),
    prisma.user.count({ where }),
  ]);

  return { data: users.map(formatUser), total };
}

export async function getById(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      ...userSelect,
      academic_unit_professors: {
        include: {
          professor: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              active: true,
              created_at: true,
            },
          },
        },
      },
    },
  });

  if (!user) throw new AppError(404, "Unidad academica no encontrada");

  const roles = user.user_roles.map((ur: any) => ur.role);
  if (!roles.some((r: any) => r.name === "academicUnit")) {
    throw new AppError(404, "Unidad academica no encontrada");
  }

  const { user_roles, academic_unit_professors, ...rest } = user;
  return {
    ...rest,
    roles,
    professors: academic_unit_professors.map((pa: any) => pa.professor),
  };
}

export async function create(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  active: boolean;
}) {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) throw new AppError(409, "Ya existe un usuario con ese email");

  const role = await prisma.role.findUnique({
    where: { name: "academicUnit" },
  });
  if (!role) throw new AppError(500, "Rol academicUnit no encontrado");

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: bcrypt.hashSync(data.password, 10),
      active: data.active,
      user_roles: { create: { role_id: role.id } },
    },
    select: userSelect,
  });

  return formatUser(user);
}

export async function update(
  id: number,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    active?: boolean;
  },
) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError(404, "Unidad academica no encontrada");

  if (data.email && data.email !== user.email) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new AppError(409, "Ya existe un usuario con ese email");
  }

  const updateData: any = { ...data };
  if (data.password) {
    updateData.password = bcrypt.hashSync(data.password, 10);
  }

  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
    select: userSelect,
  });

  return formatUser(updated);
}

export async function remove(id: number) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError(404, "Unidad academica no encontrada");

  await prisma.user.delete({ where: { id } });
  return { success: true };
}

export async function associateProfessor(
  academicUnitId: number,
  professorId: number,
) {
  const exists = await prisma.professorAcademicUnit.findUnique({
    where: {
      professor_id_academic_unit_id: {
        professor_id: professorId,
        academic_unit_id: academicUnitId,
      },
    },
  });
  if (exists)
    throw new AppError(
      409,
      "El profesor ya esta asociado a esta unidad academica",
    );

  await prisma.professorAcademicUnit.create({
    data: { professor_id: professorId, academic_unit_id: academicUnitId },
  });
  return { success: true };
}

export async function disassociateProfessor(
  academicUnitId: number,
  professorId: number,
) {
  try {
    await prisma.professorAcademicUnit.delete({
      where: {
        professor_id_academic_unit_id: {
          professor_id: professorId,
          academic_unit_id: academicUnitId,
        },
      },
    });
    return { success: true };
  } catch {
    throw new AppError(404, "Asociacion no encontrada");
  }
}
