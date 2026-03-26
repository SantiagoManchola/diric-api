import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { AppError } from "../../middleware/errorHandler";
import type { RoleName } from "@prisma/client";
import type { AuthPayload } from "../../middleware/auth";

const ROLE_PRIORITY: RoleName[] = ["admin", "academicUnit", "profesor"];

function excludePassword<T extends { password: string }>(user: T) {
  const { password: _, ...safe } = user;
  return safe;
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { user_roles: { include: { role: true } } },
  });

  if (!user || !bcrypt.compareSync(password, user.password)) {
    throw new AppError(401, "Credenciales invalidas");
  }

  if (!user.active) {
    throw new AppError(403, "Usuario inactivo. Contacte al administrador.");
  }

  const roles = user.user_roles.map((ur) => ur.role);

  if (roles.length === 0) {
    throw new AppError(403, "Usuario sin rol asignado");
  }

  const primaryRole =
    ROLE_PRIORITY.find((rn) => roles.some((r) => r.name === rn)) ||
    roles[0].name;

  const payload: AuthPayload = { userId: user.id, primaryRole };
  const signOptions: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as any };
  const token = jwt.sign(payload, env.JWT_SECRET, signOptions);

  return {
    success: true,
    token,
    session: {
      user: excludePassword(user),
      roles,
      primaryRole,
    },
  };
}

export async function getSession(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { user_roles: { include: { role: true } } },
  });

  if (!user) return null;

  const roles = user.user_roles.map((ur) => ur.role);
  const primaryRole =
    ROLE_PRIORITY.find((rn) => roles.some((r) => r.name === rn)) ||
    roles[0]?.name;

  return {
    user: excludePassword(user),
    roles,
    primaryRole,
  };
}
