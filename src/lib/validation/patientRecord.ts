import { z } from "zod";

const bloodGroupSchema = z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]);
const genotypeSchema = z.enum(["AA", "AS", "SS", "AC", "SC", "CC"]);

const emergencyContactSchema = z.object({
  name: z.string().trim().min(1, "Emergency contact name is required"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,15}$/, "Enter a valid phone number"),
  relationship: z.string().trim().min(1, "Relationship is required"),
});

/**
 * Validates the emergency-subset patient record a CHW captures in the
 * field. This is intentionally the *only* shape of data this tool ever
 * hashes and attests — see README § Data Model (emergency subset).
 */
export const patientRecordInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  age: z.coerce.number().int().min(0).max(130),
  photoUrl: z.string().url().optional(),
  bloodGroup: bloodGroupSchema,
  genotype: genotypeSchema,
  allergies: z.array(z.string().trim().min(1)).default([]),
  medications: z.array(z.string().trim().min(1)).default([]),
  chronicConditions: z.array(z.string().trim().min(1)).default([]),
  emergencyContacts: z
    .array(emergencyContactSchema)
    .min(1, "At least one emergency contact is required"),
  language: z.string().trim().min(1, "Language is required"),
});

export type PatientRecordInput = z.infer<typeof patientRecordInputSchema>;

export function parsePatientRecordInput(data: unknown) {
  return patientRecordInputSchema.safeParse(data);
}
