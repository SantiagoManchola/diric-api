import { z } from "zod";

const visitorSchema = z.object({
  name: z.string().min(1, "Nombre del visitante requerido"),
  phone: z.string().default(""),
  email: z.string().default(""),
  role: z.string().default(""),
});

const activitySchema = z.object({
  activity: z.string().min(1, "Actividad requerida"),
  detail: z.string().default(""),
});

const resultSchema = z.object({
  type: z.string().min(1, "Tipo requerido"),
  detail: z.string().default(""),
});

const commitmentSchema = z.object({
  detail: z.string().min(1, "Detalle requerido"),
  responsible: z.string().default(""),
  date_text: z.string().default(""),
});

export const createEventSchema = z.object({
  project_id: z.number().int().positive(),
  type: z.enum([
    "mesa_trabajo",
    "socializacion_externa",
    "socializacion_interna",
  ]),
  title: z.string().min(1, "Titulo requerido"),
  location: z.string().optional(),
  description: z.string().min(1, "Descripcion requerida"),
  entity_name: z.string().optional(),
  entity_website: z.string().optional(),
  entity_sector: z
    .enum(["academia", "empresa", "estado", "sociedad"])
    .optional(),
  anfitrion_name: z.string().optional(),
  anfitrion_email: z.string().optional(),
  anfitrion_phone: z.string().optional(),
  anfitrion_role: z.string().optional(),
  visitors: z.array(visitorSchema).default([]),
  activities: z.array(activitySchema).default([]),
  results: z.array(resultSchema).default([]),
  commitments: z.array(commitmentSchema).default([]),
  visit_purpose: z.string().optional(),
  visit_justification: z.string().optional(),
  conclusions: z.string().default(""),
  start_datetime: z.string().min(1, "Fecha/hora de inicio requerida"),
  end_datetime: z.string().min(1, "Fecha/hora de fin requerida"),
  encargado_id: z.number().int().positive(),
});

export const updateEventSchema = z.object({
  project_id: z.number().int().positive().optional(),
  type: z
    .enum(["mesa_trabajo", "socializacion_externa", "socializacion_interna"])
    .optional(),
  title: z.string().min(1).optional(),
  location: z.string().nullable().optional(),
  description: z.string().min(1).optional(),
  entity_name: z.string().nullable().optional(),
  entity_website: z.string().nullable().optional(),
  entity_sector: z
    .enum(["academia", "empresa", "estado", "sociedad"])
    .nullable()
    .optional(),
  anfitrion_name: z.string().nullable().optional(),
  anfitrion_email: z.string().nullable().optional(),
  anfitrion_phone: z.string().nullable().optional(),
  anfitrion_role: z.string().nullable().optional(),
  visitors: z.array(visitorSchema).optional(),
  activities: z.array(activitySchema).optional(),
  results: z.array(resultSchema).optional(),
  commitments: z.array(commitmentSchema).optional(),
  visit_purpose: z.string().nullable().optional(),
  visit_justification: z.string().nullable().optional(),
  conclusions: z.string().optional(),
  start_datetime: z.string().optional(),
  end_datetime: z.string().optional(),
  encargado_id: z.number().int().positive().optional(),
});

export const createAttendeeSchema = z.object({
  user_id: z.number().int().positive(),
  status: z.enum(["attended", "absent", "excused"]).default("attended"),
  note: z.string().default(""),
});

export const updateAttendeeSchema = z.object({
  status: z.enum(["attended", "absent", "excused"]),
  note: z.string().default(""),
});
