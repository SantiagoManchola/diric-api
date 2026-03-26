import { z } from "zod";

export const createCountrySchema = z.object({
  code: z
    .string()
    .length(2, "El codigo debe tener exactamente 2 letras")
    .toUpperCase(),
  name: z.string().min(1, "Nombre requerido").trim(),
});

export const updateCountrySchema = z.object({
  code: z
    .string()
    .length(2, "El codigo debe tener exactamente 2 letras")
    .toUpperCase()
    .optional(),
  name: z.string().min(1, "Nombre requerido").trim().optional(),
});

export const searchQuerySchema = z.object({
  search: z.string().optional(),
});
