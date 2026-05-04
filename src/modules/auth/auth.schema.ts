import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(1, "Password requerido"),
});

export const googleLoginSchema = z.object({
  idToken: z.string().min(1, "ID token de Google requerido"),
});
