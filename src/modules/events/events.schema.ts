import { z } from "zod";

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
  entity_sector: z
    .enum(["academia", "empresa", "estado", "sociedad"])
    .optional(),
  entity_contact_name: z.string().optional(),
  entity_contact_email: z.string().optional(),
  entity_contact_phone: z.string().optional(),
  event_development: z.string().optional(),
  activity_details: z.string().optional(),
  results_summary: z.string().optional(),
  agreements: z.string().optional(),
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
  entity_sector: z
    .enum(["academia", "empresa", "estado", "sociedad"])
    .nullable()
    .optional(),
  entity_contact_name: z.string().nullable().optional(),
  entity_contact_email: z.string().nullable().optional(),
  entity_contact_phone: z.string().nullable().optional(),
  event_development: z.string().nullable().optional(),
  activity_details: z.string().nullable().optional(),
  results_summary: z.string().nullable().optional(),
  agreements: z.string().nullable().optional(),
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
