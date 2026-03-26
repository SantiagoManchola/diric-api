import { z } from "zod";

export const createProjectSchema = z.object({
  country_id: z.number().int().positive(),
  title: z.string().min(1, "Titulo requerido"),
  description: z.string().min(1, "Descripcion requerida"),
  status: z
    .enum(["planificado", "en_progreso", "completado", "cancelado"])
    .default("planificado"),
  start_date: z.string().min(1, "Fecha de inicio requerida"),
  deadline: z.string().min(1, "Fecha limite requerida"),
  end_date: z.string().nullable().optional(),
});

export const updateProjectSchema = z.object({
  country_id: z.number().int().positive().optional(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  status: z
    .enum(["planificado", "en_progreso", "completado", "cancelado"])
    .optional(),
  start_date: z.string().min(1).optional(),
  deadline: z.string().min(1).optional(),
  end_date: z.string().nullable().optional(),
});

export const createAssignmentSchema = z.object({
  user_id: z.number().int().positive(),
  role_in_project: z.string().min(1, "Rol en proyecto requerido"),
});
