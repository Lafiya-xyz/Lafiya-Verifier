# Contributing to Lafiya Verifier

Thanks for helping build the CHW verification layer for Lafiya. This repo is
pre-alpha, so expect the shape of things to move — read the README's
Architecture and Data Model sections first for context on why things are
structured this way.

## Getting started

```bash
git clone https://github.com/lafiya-xyz/lafiya-verifier
cd lafiya-verifier
cp .env.example .env.local   # fill in Supabase + Stellar testnet values
npm install
npm run dev
```

You don't need real Supabase/Soroban credentials to run the test suite —
only the dev server and `npm run build` read `.env.local`.

## Before opening a PR

Run the full check suite locally; CI runs the same commands:

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

## Conventions

- **No personal health data on-chain, ever.** Only hashes, attester
  identities, and timestamps reach Soroban — see README § Core Design
  Principle. If a change would put more than that on-chain, it's wrong.
- **Dependency injection for testability.** Functions that talk to Supabase
  or Soroban take the client/server as a parameter (see
  `src/lib/supabase/*Repository.ts`, `src/lib/stellar/attestationContract.ts`)
  so tests can inject a fake instead of hitting the network. Follow the same
  pattern for new integrations.
- **Route handlers stay thin.** Next.js route files (`src/app/api/**/route.ts`)
  only wire up real dependencies and delegate to a `handler.ts` that's unit
  tested directly, without going through the Next.js server.
- **Cross-repo schema changes.** If you touch the attestation record shape
  (hash, attester identity, timestamp) or the emergency-record field list,
  flag it — `lafiya-contracts` (Rust) and `lafiya-web` (TypeScript) both need
  to stay in sync. See README § Lafiya Organization.

## Commit style

Small, atomic commits with an imperative subject line (`feat: add X`,
`fix: correct Y`, `test: cover Z`). Prefer several focused commits over one
large one — it makes review and `git bisect` easier.

## Code of conduct

Be respectful and assume good faith. This project supports emergency health
decisions for real patients; treat correctness and privacy review requests
accordingly.
