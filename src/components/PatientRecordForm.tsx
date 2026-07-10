"use client";

import { useState, type FormEvent } from "react";
import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";
import { Select } from "./ui/Select";
import { parsePatientRecordInput } from "@/lib/validation/patientRecord";
import type { BloodGroup, Genotype } from "@/types";

const BLOOD_GROUPS: readonly BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENOTYPES: readonly Genotype[] = ["AA", "AS", "SS", "AC", "SC", "CC"];

interface FormState {
  accessToken: string;
  name: string;
  age: string;
  bloodGroup: string;
  genotype: string;
  allergies: string;
  medications: string;
  chronicConditions: string;
  language: string;
  contactName: string;
  contactPhone: string;
  contactRelationship: string;
}

const INITIAL_STATE: FormState = {
  accessToken: "",
  name: "",
  age: "",
  bloodGroup: "",
  genotype: "",
  allergies: "",
  medications: "",
  chronicConditions: "",
  language: "",
  contactName: "",
  contactPhone: "",
  contactRelationship: "",
};

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

type SubmitResult =
  | { status: "idle" }
  | { status: "success"; recordId: string }
  | { status: "error"; message: string };

export function PatientRecordForm() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<SubmitResult>({ status: "idle" });
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});
    setResult({ status: "idle" });

    const parsed = parsePatientRecordInput({
      name: form.name,
      age: form.age,
      bloodGroup: form.bloodGroup,
      genotype: form.genotype,
      allergies: splitList(form.allergies),
      medications: splitList(form.medications),
      chronicConditions: splitList(form.chronicConditions),
      language: form.language,
      emergencyContacts: [
        {
          name: form.contactName,
          phone: form.contactPhone,
          relationship: form.contactRelationship,
        },
      ],
    });

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/records", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${form.accessToken}`,
        },
        body: JSON.stringify(parsed.data),
      });

      const body = await response.json();
      if (!response.ok) {
        setResult({
          status: "error",
          message: typeof body.error === "string" ? body.error : "Failed to save the record",
        });
        return;
      }

      setResult({ status: "success", recordId: body.record.id });
    } catch {
      setResult({ status: "error", message: "Network error — check your connection and try again" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <TextField
        label="CHW access token"
        value={form.accessToken}
        onChange={(event) => update("accessToken", event.target.value)}
        placeholder="Session token from your CHW login"
        required
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Patient name"
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
          error={fieldErrors.name}
          required
        />
        <TextField
          label="Age"
          type="number"
          min={0}
          max={130}
          value={form.age}
          onChange={(event) => update("age", event.target.value)}
          error={fieldErrors.age}
          required
        />
        <Select
          label="Blood group"
          options={BLOOD_GROUPS}
          value={form.bloodGroup}
          onChange={(event) => update("bloodGroup", event.target.value)}
          error={fieldErrors.bloodGroup}
          required
        />
        <Select
          label="Genotype"
          options={GENOTYPES}
          value={form.genotype}
          onChange={(event) => update("genotype", event.target.value)}
          error={fieldErrors.genotype}
          required
        />
        <TextField
          label="Language"
          value={form.language}
          onChange={(event) => update("language", event.target.value)}
          error={fieldErrors.language}
          required
        />
      </div>

      <TextField
        label="Allergies (comma-separated)"
        value={form.allergies}
        onChange={(event) => update("allergies", event.target.value)}
      />
      <TextField
        label="Medications (comma-separated)"
        value={form.medications}
        onChange={(event) => update("medications", event.target.value)}
      />
      <TextField
        label="Chronic conditions (comma-separated)"
        value={form.chronicConditions}
        onChange={(event) => update("chronicConditions", event.target.value)}
      />

      <fieldset className="flex flex-col gap-4 rounded-md border border-slate-200 p-4 dark:border-slate-700">
        <legend className="px-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Emergency contact
        </legend>
        <TextField
          label="Contact name"
          value={form.contactName}
          onChange={(event) => update("contactName", event.target.value)}
          error={fieldErrors["emergencyContacts.0.name"]}
          required
        />
        <TextField
          label="Contact phone"
          value={form.contactPhone}
          onChange={(event) => update("contactPhone", event.target.value)}
          error={fieldErrors["emergencyContacts.0.phone"]}
          required
        />
        <TextField
          label="Relationship"
          value={form.contactRelationship}
          onChange={(event) => update("contactRelationship", event.target.value)}
          error={fieldErrors["emergencyContacts.0.relationship"]}
          required
        />
      </fieldset>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving…" : "Save patient record"}
      </Button>

      {result.status === "success" ? (
        <p role="status" className="text-sm font-medium text-lafiya-teal">
          Record saved (id: {result.recordId}). Ready for attestation.
        </p>
      ) : null}
      {result.status === "error" ? (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
          {result.message}
        </p>
      ) : null}
    </form>
  );
}
