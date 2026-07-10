import type { SupabaseClient } from "@supabase/supabase-js";
import type { PatientRecordInput } from "@/lib/validation/patientRecord";
import type { PatientRecord } from "@/types";

const TABLE = "patient_records";

interface PatientRecordRow {
  id: string;
  name: string;
  age: number;
  photo_url: string | null;
  blood_group: PatientRecord["bloodGroup"];
  genotype: PatientRecord["genotype"];
  allergies: string[];
  medications: string[];
  chronic_conditions: string[];
  emergency_contacts: PatientRecord["emergencyContacts"];
  language: string;
}

function rowToPatientRecord(row: PatientRecordRow): PatientRecord {
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    photoUrl: row.photo_url ?? undefined,
    bloodGroup: row.blood_group,
    genotype: row.genotype,
    allergies: row.allergies,
    medications: row.medications,
    chronicConditions: row.chronic_conditions,
    emergencyContacts: row.emergency_contacts,
    language: row.language,
  };
}

/**
 * Creates or updates a patient's emergency profile in the off-chain store.
 * Pass `id` to update an existing record; omit it to create a new one.
 */
export async function upsertPatientRecord(
  client: SupabaseClient,
  input: PatientRecordInput,
  id?: string,
): Promise<PatientRecord> {
  const { data, error } = await client
    .from(TABLE)
    .upsert({
      ...(id ? { id } : {}),
      name: input.name,
      age: input.age,
      photo_url: input.photoUrl ?? null,
      blood_group: input.bloodGroup,
      genotype: input.genotype,
      allergies: input.allergies,
      medications: input.medications,
      chronic_conditions: input.chronicConditions,
      emergency_contacts: input.emergencyContacts,
      language: input.language,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save patient record: ${error.message}`);
  }

  return rowToPatientRecord(data as PatientRecordRow);
}

/** Loads a patient record by id, or null if it doesn't exist. */
export async function getPatientRecordById(
  client: SupabaseClient,
  id: string,
): Promise<PatientRecord | null> {
  const { data, error } = await client.from(TABLE).select().eq("id", id).maybeSingle();

  if (error) {
    throw new Error(`Failed to load patient record ${id}: ${error.message}`);
  }

  return data ? rowToPatientRecord(data as PatientRecordRow) : null;
}
