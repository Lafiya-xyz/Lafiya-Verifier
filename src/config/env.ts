import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SOROBAN_RPC_URL: z.string().url(),
  STELLAR_NETWORK_PASSPHRASE: z.string().min(1),
  ATTESTATION_CONTRACT_ID: z.string().min(1),
  VERIFIER_SERVICE_SECRET_KEY: z.string().min(1).optional(),
  CHW_PAYOUT_AMOUNT_USDC: z.coerce.number().positive().default(2),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | undefined;

/**
 * Validates and returns process.env against the schema this app requires.
 * Throws with a readable message naming every missing/invalid variable,
 * rather than failing deep inside a Stellar or Supabase call.
 */
export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid or missing environment variables:\n${issues}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}
