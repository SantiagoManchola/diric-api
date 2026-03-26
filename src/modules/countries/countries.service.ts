import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/errorHandler";

export async function getAll(search?: string) {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { code: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.country.findMany({ where, orderBy: { name: "asc" } }),
    prisma.country.count({ where }),
  ]);

  return { data, total };
}

export async function getById(id: number) {
  const country = await prisma.country.findUnique({
    where: { id },
    include: { projects: true },
  });

  if (!country) throw new AppError(404, "Pais no encontrado");
  return country;
}

export async function create(data: { code: string; name: string }) {
  const exists = await prisma.country.findUnique({
    where: { code: data.code },
  });
  if (exists) throw new AppError(409, "Ya existe un pais con ese codigo");

  return prisma.country.create({ data });
}

export async function update(
  id: number,
  data: { code?: string; name?: string },
) {
  const country = await prisma.country.findUnique({ where: { id } });
  if (!country) throw new AppError(404, "Pais no encontrado");

  if (data.code) {
    const exists = await prisma.country.findFirst({
      where: { code: data.code, NOT: { id } },
    });
    if (exists) throw new AppError(409, "Ya existe un pais con ese codigo");
  }

  return prisma.country.update({ where: { id }, data });
}

export async function remove(id: number) {
  const country = await prisma.country.findUnique({ where: { id } });
  if (!country) throw new AppError(404, "Pais no encontrado");

  await prisma.country.delete({ where: { id } });
  return { success: true };
}
