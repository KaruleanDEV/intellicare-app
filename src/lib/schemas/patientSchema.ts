// src/lib/schemas/patientSchema.ts
import { z } from 'zod';

const GenderEnum = z.enum(["Male", "Female", "Other"]);
const NationalityEnum = z.enum(["Malaysian", "Singaporean", "Other"]);

export const patientSchema = z.object({
  first_name: z.string().min(1, "First name is required."),
  last_name: z.string().min(1, "Last name is required."),
  date_of_birth: z.coerce.date().optional(),
  // Ensure data is a valid type or empty
  gender: z.union([GenderEnum, z.literal("")]).default("").refine(
    (val) => val !== "",
    { message: "Please select a gender." }
  ),
  nationality: z.union([NationalityEnum, z.literal("")]).default("").refine(
    (val) => val !== "",
    { message: "Please select a nationality." }
  ),
});