import { z } from "zod";

export const createProfessorSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  email: z.string().email("Email invalido"),
  phone: z.string().min(1, "Telefono requerido"),
  password: z.string().min(4, "Password debe tener al menos 4 caracteres"),
  active: z.boolean().default(true),
  academic_unit_id: z.number().int().positive().optional(),
});

export const updateProfessorSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  password: z.string().min(4).optional(),
  active: z.boolean().optional(),
});
