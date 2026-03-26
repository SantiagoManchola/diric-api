import { z } from "zod";

export const createAcademicUnitSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  email: z.string().email("Email invalido"),
  phone: z.string().min(1, "Telefono requerido"),
  password: z.string().min(4, "Password debe tener al menos 4 caracteres"),
  active: z.boolean().default(true),
});

export const updateAcademicUnitSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  password: z.string().min(4).optional(),
  active: z.boolean().optional(),
});

export const associateProfessorSchema = z.object({
  professor_id: z.number().int().positive(),
});
