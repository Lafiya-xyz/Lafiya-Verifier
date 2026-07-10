import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6 py-16">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-lafiya-teal">
          Lafiya Verifier
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
          Verify a patient record in the field
        </h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          Register a patient&apos;s emergency profile and attest it on-chain so a responder can
          trust it — without exposing the underlying health data.
        </p>
      </div>
      <Link
        href="/register"
        className="inline-flex w-fit items-center rounded-md bg-lafiya-teal px-5 py-3 font-medium text-white transition hover:opacity-90"
      >
        Start a registration
      </Link>
    </main>
  );
}
