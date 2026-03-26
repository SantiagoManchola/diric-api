import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/errorHandler";
import type { RoleName } from "@prisma/client";

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

export async function getAll(
  search?: string,
  callerRole?: RoleName,
  callerUserId?: number,
) {
  const role = await prisma.role.findUnique({ where: { name: "profesor" } });
  if (!role) return { data: [], total: 0 };

  const where: any = {
    user_roles: { some: { role_id: role.id } },
  };

  // Academic unit can only see their associated professors
  if (callerRole === "academicUnit" && callerUserId) {
    where.professor_academic_units = {
      some: { academic_unit_id: callerUserId },
    };
  }

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
      professor_academic_units: {
        include: {
          academic_unit: {
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
      project_assignments: {
        include: {
          project: true,
        },
      },
    },
  });

  if (!user) throw new AppError(404, "Profesor no encontrado");

  const roles = user.user_roles.map((ur: any) => ur.role);
  if (!roles.some((r: any) => r.name === "profesor")) {
    throw new AppError(404, "Profesor no encontrado");
  }

  const { user_roles, professor_academic_units, ...rest } = user;
  return {
    ...rest,
    roles,
    academic_units: professor_academic_units.map((pa: any) => pa.academic_unit),
  };
}

export async function create(
  data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    active: boolean;
    academic_unit_id?: number;
  },
  callerRole?: RoleName,
  callerUserId?: number,
) {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) throw new AppError(409, "Ya existe un usuario con ese email");

  const role = await prisma.role.findUnique({ where: { name: "profesor" } });
  if (!role) throw new AppError(500, "Rol profesor no encontrado");

  // Determine academic unit to associate
  const academicUnitId =
    data.academic_unit_id ||
    (callerRole === "academicUnit" ? callerUserId : undefined);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: bcrypt.hashSync(data.password, 10),
      active: data.active,
      user_roles: { create: { role_id: role.id } },
      ...(academicUnitId
        ? {
            professor_academic_units: {
              create: { academic_unit_id: academicUnitId },
            },
          }
        : {}),
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
  if (!user) throw new AppError(404, "Profesor no encontrado");

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
  if (!user) throw new AppError(404, "Profesor no encontrado");

  await prisma.user.delete({ where: { id } });
  return { success: true };
}
