import { PatientRecordForm } from "@/components/PatientRecordForm";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-lafiya-teal">
          CHW Registration
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
          Register a patient&apos;s emergency profile
        </h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          Capture the emergency-subset fields in the field. Saving writes the
          record to the off-chain profile store; the record isn&apos;t
          attested on-chain until you submit an attestation for it.
        </p>
      </div>
      <PatientRecordForm />
    </main>
  );
}
