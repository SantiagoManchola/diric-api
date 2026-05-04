import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { AppError } from "../../middleware/errorHandler";
import type { RoleName } from "@prisma/client";
import type { AuthPayload } from "../../middleware/auth";

const ROLE_PRIORITY: RoleName[] = ["admin", "academicUnit", "profesor"];

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

function excludePassword<T extends { password: string }>(user: T) {
  const { password: _, ...safe } = user;
  return safe;
}

function buildSession(
  user: { id: number; user_roles: { role: { id: number; name: RoleName; description: string } }[] } & Record<string, unknown>,
) {
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
      user: excludePassword(user as any),
      roles,
      primaryRole,
    },
  };
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

  return buildSession(user);
}

export async function googleLogin(idToken: string) {
  // 1. Verify the token is valid and issued by Google for our app
  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
  } catch {
    throw new AppError(401, "Token de Google invalido");
  }

  const payload = ticket.getPayload();
  if (!payload?.email) {
    throw new AppError(401, "No se pudo obtener el email de Google");
  }

  const { email, sub: googleId } = payload;

  // 2. User MUST already exist in the DB — no auto-registration
  const user = await prisma.user.findUnique({
    where: { email },
    include: { user_roles: { include: { role: true } } },
  });

  if (!user) {
    throw new AppError(403, "No tienes acceso al sistema. Contacta al administrador.");
  }

  if (!user.active) {
    throw new AppError(403, "Usuario inactivo. Contacta al administrador.");
  }

  // 3. Persist google_id on first Google login so future lookups can also match by it
  if (!user.google_id) {
    await prisma.user.update({
      where: { id: user.id },
      data: { google_id: googleId },
    });
  }

  return buildSession(user);
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
