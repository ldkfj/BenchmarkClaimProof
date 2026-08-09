# BenchmarkClaimProof

BenchmarkClaimProof is a GenLayer registry that checks whether one frozen public AI-performance claim is fairly supported by one cited MLPerf Inference v6.0 result row.

## Verified links

- Live app: pending Vercel deployment
- [Studionet contract](https://explorer-studio.genlayer.com/address/0xf53ABE770a544C0a26E5e08936C7b5F60b4a0Ec5)
- [Deployment transaction](https://explorer-studio.genlayer.com/tx/0x1768e5bf4addeeee5024765a4b1b2a86b3a26add67168eb29aac8b1f93ef5c6d)
- Network: GenLayer Studionet, chain ID `61999`

## Trust problem

Hardware and cloud vendors can highlight favorable benchmark numbers while omitting release, scenario, accuracy, availability, hardware count, or system configuration. Buyers and analysts can also compare rows that are not actually comparable. A vendor should not approve its own marketing claim, and a challenger should not be able to replace the cited official row with a different one.

## Why GenLayer is essential

Deterministic code can confirm identifiers and byte ranges, but it cannot decide whether natural-language marketing text preserves the scope and qualifications of an official result. The Intelligent Contract independently fetches the public claim and pinned official MLCommons evidence, asks validators to rederive the semantic outcome, and stores the accepted badge and exact evidence binding on-chain. Without GenLayer web access, LLM judgment, and validator consensus, the core decision does not exist.

## How it works

1. A registrant supplies a public HTTPS source, the exact frozen claim text, an official result ID, a pinned MLCommons commit, and the selected row's byte range.
2. The contract independently verifies both sources and stores an immutable claim record.
3. Any verifier can trigger an assessment. Validators independently compare the claim with the same bound official row and agree on the evidence identity and final outcome.
4. A challenger can retry an unresolved assessment or cite a provably newer official commit. Existing records remain immutable.
5. Readers inspect the badge, exact comparison dimensions, and ordered assessment history without connecting a wallet.

The five outcomes are `SUPPORTED`, `QUALIFICATION_REQUIRED`, `OVERSTATED`, `NOT_COMPARABLE`, and `UNRESOLVED`.

## Architecture

- `contracts/benchmark_claim_proof.py`: the source of truth for evidence validation, semantic consensus, outcomes, immutable claims, and assessment history.
- `frontend/`: a React/Vite SPA using `genlayer-js` for real Studionet reads and writes. It locates official row byte ranges but never computes or submits a verdict.
- `tests/`: deterministic contract regression coverage.
- `docs/VERIFICATION.md`: hashes, test commands, deployment parity, and live proof evidence.

There is no backend, database, relayer, or indexer in V1.

## Intelligent Contract

The contract exposes three write methods:

- `register_claim(...)`
- `assess_claim(claim_id)`
- `request_reassessment(...)`

Five view methods return claims, assessments, latest pointers, histories, and paginated registry data. The contract fixes the MLCommons repository and release boundary, validates bounded HTTP range responses, rejects caller-supplied verdicts, and derives the outcome from validated masks using a fixed precedence order. Validators independently retrieve and assess the same evidence; they must agree exactly on evidence identity and the consequential final outcome.

The deployment is intentionally frozen and has no owner or administrative override. A material contract defect requires a freshly reviewed deployment and frontend address update.

## Transaction lifecycle

Wallet connection always starts with an explicit provider chooser. A write then moves through validation, wallet signature, submission, pending consensus, `FINALIZED`, majority agreement, transaction identity checks, and exact contract readback. The pending operation is persisted locally so a refresh can reconcile the original hash without resubmitting it.

When the current Studionet SDK omits its normalized execution field, the frontend fails closed unless the finalized majority-agreed transaction has the expected sender and target and produced a fresh on-chain record matching every submitted binding. Independent live evidence in [docs/VERIFICATION.md](docs/VERIFICATION.md) confirms successful leader and agreeing-validator execution.

## Run locally

Prerequisites:

- Node.js 20 or newer
- npm
- A wallet/provider that supports GenLayer Studionet for writes

```bash
cd frontend
cp .env.example .env.local
npm ci
npm run dev
```

Set `VITE_CONTRACT_ADDRESS` in `frontend/.env.local` to the real deployed address shown under Verified links. The example file is intentionally empty; it contains no fake address or secret.

Read-only registry use does not require a wallet.

## Tests and verification

Contract:

```bash
py -3.13 -m pytest -q
```

Current result: `10 passed`.

Frontend:

```bash
cd frontend
npm ci
npm run typecheck
npm test -- --run
npm run build
```

Current result: typecheck passed, `42/42` tests passed, and the production build passed with Vite `8.2.1`.

See [docs/VERIFICATION.md](docs/VERIFICATION.md) for the exact package hashes and Studionet proof matrix.

## Deployment

- Contract: `0xf53ABE770a544C0a26E5e08936C7b5F60b4a0Ec5`
- Deployment transaction: `0x1768e5bf4addeeee5024765a4b1b2a86b3a26add67168eb29aac8b1f93ef5c6d`
- Contract source SHA-256: `fc70f5eb200a5ec22385a5b2117b3dd85e0646f2c2010d2d95b6ffe203e1fafe`
- Classification: `INTENTIONALLY FROZEN`

The decoded deployed source hash matches the repository contract source exactly. Recovery evidence and replacement history are documented in [docs/VERIFICATION.md](docs/VERIFICATION.md).

## Security and trust boundaries

- The contract, not the frontend, determines every badge.
- Callers cannot supply an official row, repository path, mismatch mask, or verdict.
- Public web content is untrusted and constrained to validated schemas and bounded evidence.
- Exact evidence revisions are replay-protected; unresolved attempts remain retryable without weakening prior resolved history.
- Wallet/provider changes abort an active write.
- Finality alone is insufficient: sender, target, consensus, fresh state, and exact readback must also match.
- No key, seed phrase, token, or private deployment data belongs in this repository.

## Known limitations

- V1 supports only MLPerf Inference release 6.0 and its pinned official repository layout.
- Dynamic or unavailable marketing pages can produce safe unresolved or rejected results.
- One official result row cannot substantiate multi-result rankings or universal superiority claims.
- BenchmarkClaimProof is independent of MLCommons. It does not rerun benchmarks, certify vendors or products, rank systems, or use the MLPerf logo.
- The contract is intentionally frozen; material contract fixes require redeployment.

