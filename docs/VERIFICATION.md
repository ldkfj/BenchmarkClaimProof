# BenchmarkClaimProof Verification

Status: `POST_DEPLOY_TEST APPROVED`

## Reviewed revision

- Submission category: `PROJECT`
- Release source commit: `6d6367196be964b056dab5858d4909510eb95798`
- Public source SHA-256: `7b02a9636c92b1c02f4af382936e9884fe7dd8e595fd148861bfcd0d478de6d0`
- Public source digest method: SHA-256 of the UTF-8 text formed by sorting the reviewed source paths below, appending one line per file as `<forward-slash-relative-path> <lowercase-file-sha256>`, and terminating the list with a newline.
- Reviewed public source paths: `contracts/benchmark_claim_proof.py`, `tests/test_benchmark_claim_proof.py`, `frontend/.env.example`, `frontend/index.html`, `frontend/package.json`, `frontend/package-lock.json`, `frontend/tsconfig.json`, `frontend/vercel.json`, `frontend/vite.config.ts`, and every file directly under `frontend/src`.
- Approved `POST_DEPLOY_TEST` package SHA-256: `697e2647579c1cfaba652e82b026fc95f91a2a3d7ed6f460aced3c22bc2a2069`
- Approved specification SHA-256: `0248e5e47b3e1ebd38e2d47fabe366c8bd1881ab98cb63025b2a8372783594d7`
- Contract SHA-256: `fc70f5eb200a5ec22385a5b2117b3dd85e0646f2c2010d2d95b6ffe203e1fafe`
- Contract tests SHA-256: `3506e87d3b0ed1ae8ee63cf9eaeeb6d581def9c16476ef26d505b035fd9c8e48`

## Intended deployment

- Network: `Studionet`
- Chain ID: `61999`
- RPC: `https://studio.genlayer.com/api`
- Explorer: `https://explorer-studio.genlayer.com`
- Deployment wallet: `0x7885536194bbd6e1d0a6ab991ab215cfa9542339`
- Contract classification: `INTENTIONALLY FROZEN`
- Constructor arguments: none
- Replacement contract address: `0xf53ABE770a544C0a26E5e08936C7b5F60b4a0Ec5`
- Replacement deployment transaction: `0x1768e5bf4addeeee5024765a4b1b2a86b3a26add67168eb29aac8b1f93ef5c6d`
- Frontend integration: local read and frontend-originated write/reconciliation journeys passed against the replacement Studionet contract; public deployment remains pending.

The user explicitly confirmed the frozen classification and its redeployment consequence on 2026-08-09. The replacement source package received fresh exact-package `PRE_DEPLOY` approval before the user-confirmed deployment.

## Replacement deployment verification

- Status: `FINALIZED`
- Consensus: `MAJORITY_AGREE`
- Execution: leader and three agreeing validator receipts reported `SUCCESS`
- Deployment wallet and origin: `0x7885536194BbD6E1D0A6Ab991aB215CFa9542339`
- Deployed contract: `0xf53ABE770a544C0a26E5e08936C7b5F60b4a0Ec5`
- Deployed-source SHA-256: `fc70f5eb200a5ec22385a5b2117b3dd85e0646f2c2010d2d95b6ffe203e1fafe` (`PASS`, exact match after base64 decoding)
- Initial readback: `get_claims(0, 10)` returned an empty registry with total `0`
- Explorer transaction: `https://explorer-studio.genlayer.com/tx/0x1768e5bf4addeeee5024765a4b1b2a86b3a26add67168eb29aac8b1f93ef5c6d`
- Explorer contract: `https://explorer-studio.genlayer.com/address/0xf53ABE770a544C0a26E5e08936C7b5F60b4a0Ec5`

## Superseded deployment verification (historical)

- Status: `FINALIZED`
- Consensus: `MAJORITY_AGREE`
- Execution: `SUCCESS` in the successful leader/agreeing receipts
- `from_address` and `origin_address`: `0x7885536194BbD6E1D0A6Ab991aB215CFa9542339`
- Deployed contract: `0xcb7EfF3e0EEf4ffC055BA5B9BF762799d33A5268`
- Deployed-source SHA-256: `6de50138c92f66b1894365ca13dc260513370b3a7cb19ce67c235b99ac68689e` (`PASS`, exact match)
- Initial state readback: `get_claims(0, 10)` returned an empty registry with total `0`
- Explorer transaction: `https://explorer-studio.genlayer.com/tx/0x502431a18b34d04f009897abb1bbeeb6fb3c06687d49961c605650c832542896`
- Explorer contract: `https://explorer-studio.genlayer.com/address/0xcb7EfF3e0EEf4ffC055BA5B9BF762799d33A5268`

## Historical live registration evidence

- Transaction: `0x41ba540150449b2d031469783e146233f03bd5d23b86105421e935e43e8cde40`
- Actor: deployment wallet `0x7885536194BbD6E1D0A6Ab991aB215CFa9542339`
- Target: deployed contract `0xcb7EfF3e0EEf4ffC055BA5B9BF762799d33A5268`
- Result: `FINALIZED`, `MAJORITY_AGREE`; leader and three agreeing validator receipts reported `SUCCESS` with the same contract state hash `b73bd5f7b53ffe18e5aec5b4a58ec6325fd585c2c0a5a33565fd6aab2e05e732`
- Return/readback: claim ID `1`; `get_claim(1)` and registry total `1` confirmed the exact claim text, source URL, result ID `6.0-0101`, commit, bytes `748431-749749`, official row identity, and fingerprints
- Control transaction: `0x5a11311bfe3a7b7c8ca9e2f507384844a9885fb80a0ae02cc2efc267329d8289`; `FINALIZED`, `MAJORITY_AGREE`, leader and three agreeing receipts `SUCCESS`
- Control readback: claim ID `2`; `get_claim(2)` confirmed result `6.0-0001`, bytes `4-1438`, exact official row identity, and fingerprint `94bffbf67fd65afaf89f9d3513ac52c4f4ddb508bf2bff931cc6cb3963f88713`

## Historical live consensus-disagreement evidence and replacement trigger

- Transaction: `0xa31594125d6014922799fd294e39b063a503d131314ad5ce3e8719844b5eb626`
- Retry transaction: `0x69ac7f16bbe41ad26fe2cad1d4034acfbbbf78e27fadcdb6b37f232c4b0705c6`
- Final retry transaction: `0x9094827c5f8b85dfa076548a015ccd8305f8e5c278bdaed565940cdb989a6041`
- Action: `assess_claim(1)`
- Result: all three attempts reached `FINALIZED`, `MAJORITY_DISAGREE`
- Safe-failure readback: `get_latest_assessment(1)` returned `latest_attempt: null` and `latest_resolved: null`; assessment history total remained `0`
- Classification: expected disagreement/no-write evidence, not a successful assessment journey
- Root cause: exact equality of all four explanatory masks made liveness depend on validators selecting identical bit-level explanations even when they derived the same final badge
- Replacement correction: validators independently reassess the same bound evidence, exact-match evidence identity, validate mask bounds, and compare the deterministic final outcome; same-outcome mask drift is accepted, while cross-outcome drift is rejected

## Verification results

### Contract

- Python: `3.13`
- `pytest`: `9.1.1`
- `genlayer-test`: `0.1.2`
- Command: `py -3.13 -m pytest -q`
- Result: `10 passed`
- Revision `0.4` recheck: `10 passed in 0.03s`; the suite deterministically covers all five verdicts and precedence boundaries.
- `genvm-lint`: `0.11.0`
- Command: `genvm-lint check contracts/benchmark_claim_proof.py` with UTF-8 console mode
- Result: lint passed (3 checks); semantic validation passed; contract `BenchmarkClaimProof`; 8 public methods (5 view, 3 write)
- Informational diagnostic: the pinned `py-genlayer` runner remains accepted by validation, while the linter reports that a newer runner is available. No dependency change is included in this reviewed revision.

### Frontend

- `npm run typecheck`: passed
- `npm test -- --run`: 42 tests passed across 2 files
- `npm run build`: passed with Vite `8.2.1`
- `npm audit --omit=dev`: 0 vulnerabilities
- Non-blocking build diagnostic: the main production chunk is approximately 669.01 kB before gzip and triggers Vite's 500 kB advisory.

### Browser review

- Reviewed at widths 320, 375, 414, 768, 1280, and 1920 pixels with no horizontal overflow.
- Verified `/`, `/register`, `/about`, and unknown-route behavior.
- Verified the missing-deployment state without a fake address.
- Verified that Connect Wallet opens a provider chooser and does not silently connect the first injected wallet.
- Verified the no-provider state and registry search dialog.
- Browser console contained no warnings or errors during the reviewed flows.
- Local runtime integration used the real replacement address `0xf53ABE770a544C0a26E5e08936C7b5F60b4a0Ec5`. The registry loaded two on-chain records, showing claim `1` as `SUPPORTED` and claim `2` as `UNRESOLVED`.
- Claim `1` detail showed assessment `1`, the bound AMD row, and `SUPPORTED` history. Claim `2` detail showed assessment `3`, the bound Intel row, and ordered `UNRESOLVED` history entries `2` and `3`.
- A frontend-originated `assess_claim(5)` journey used explicit provider selection and wallet submission, persisted the pending operation, reconciled the finalized transaction without resubmission, and refreshed the page to assessment history IDs `6, 7`.
- Frontend transaction: `0x23f5dd67f82971118ecd49d2313619697f0716bdfce98f923e2da304cf9dceb7`; sender `0x7885536194BbD6E1D0A6Ab991aB215CFa9542339`; target `0xf53ABE770a544C0a26E5e08936C7b5F60b4a0Ec5`; `FINALIZED`; `MAJORITY_AGREE`; successful leader and three agreeing validator receipts reported `SUCCESS` with state hash `0540e539a02908fec8a27bdff8d0272ebb2f9d0e7869c599e7f61de5819aff8f`.
- Exact readback: assessment `7`, claim `5`, assessor equals the submitting wallet, result `6.0-0101`, commit `4d3916ac9cf474b679cdfcf492d43a0559418ad1`, bytes `748431-749749`, outcome `UNRESOLVED`, masks `0/0/57/39`, prior attempt `6`, latest attempt `7`, latest resolved `null`; persisted pending state cleared.

## Preliminary category and scorecard

Category: `PROJECT`

Studionet deployment, contract calls, frontend integration, Explorer evidence, and the `POST_DEPLOY_TEST` review are complete. GitHub publication, Vercel deployment, and the final checkpoint remain pending.

- GenLayer fit: `4/5` based on a consequential semantic comparison between a frozen commercial claim and an official MLPerf result taxonomy, exact deployment parity, and successful live `SUPPORTED`, `OVERSTATED`, and `UNRESOLVED` consensus outcomes.
- Contract quality: `4/5` based on fixed evidence boundaries, outcome-preserving consensus, safe unresolved behavior, revision lineage, tests, lint, validation, exact replacement deployment parity, all three successful live write paths, and replay rejection with unchanged state.
- Engineering: `4/5` based on passing contract/frontend checks, a bounded public source package, and a source commit bound to reproducible hashes.
- Frontend / UX: `4/5` based on real SDK integration, explicit provider selection, wallet submission, numeric finality normalization, bounded restart-safe reconciliation, exact on-chain readback, responsive behavior, and successful local read/write journeys. Public deployment remains absent.

Submission recommendation: `NOT READY` until GitHub, Vercel, and the final review gate pass.

## Known limitations

- V1 supports only MLPerf Inference release 6.0 and one pinned official repository/file layout.
- Official result formats, repository lineage, source pages, or remote availability may change.
- Dynamic marketing pages may fail stable capture or exact text containment and must fail safely.
- The contract assesses whether one frozen claim is supported by one cited result; it does not rerun MLPerf, certify general product quality, or prove universal system superiority.
- The contract is intentionally frozen. A material defect requires a new reviewed deployment and frontend address replacement.
- The historical Studionet deployment remains frozen and exhibited repeated assessment disagreement. The corrected replacement deployment has exact source parity, all three write methods exercised successfully, resolved `SUPPORTED` and `OVERSTATED` outcomes, `UNRESOLVED` plus retry, replay rejection with unchanged state, and local frontend read/write journeys. Deterministic tests cover all five verdicts and precedence; public deployment remains pending.
- The official repository `main` currently equals the registered commit `4d3916ac9cf474b679cdfcf492d43a0559418ad1`; no strictly newer official commit exists for a resolved-claim reassessment test yet.

## Historical proof matrix for superseded deployment

This matrix must be completed only with real Studionet transactions and readbacks:

| Actor | Action | Contract method | Transaction | FINALIZED / execution | Readback | Result |
| --- | --- | --- | --- | --- | --- | --- |
| Claimant | Register frozen claim | `register_claim` | `0x41ba540150449b2d031469783e146233f03bd5d23b86105421e935e43e8cde40`; control `0x5a11311bfe3a7b7c8ca9e2f507384844a9885fb80a0ae02cc2efc267329d8289` | Both `FINALIZED` / `MAJORITY_AGREE` / leader and agreeing receipts `SUCCESS` | Claims `1` and `2` returned and matched exact evidence bindings | `PASS` |
| Verifier | Attempt assessment; validator disagreement | `assess_claim` | `0xa31594125d6014922799fd294e39b063a503d131314ad5ce3e8719844b5eb626`, `0x69ac7f16bbe41ad26fe2cad1d4034acfbbbf78e27fadcdb6b37f232c4b0705c6`, `0x9094827c5f8b85dfa076548a015ccd8305f8e5c278bdaed565940cdb989a6041` | All `FINALIZED` / `MAJORITY_DISAGREE` | Latest pointers remained `null`; history total remained `0` | `SAFE FAILURE PASS`; not a successful write path |
| Verifier | Assess registered claim | `assess_claim` |  |  | `get_assessment`, `get_latest_assessment` |  |
| Challenger | Request reassessment | `request_reassessment` |  |  |  | Not exercised on superseded deployment |

Failed, pending, accepted-only, timed-out, consensus-disagreed, or finalized-with-error transactions must not be recorded as successful proof.

## Replacement deployment proof matrix

| Actor | Action | Contract method | Transaction | FINALIZED / execution | Readback | Result |
| --- | --- | --- | --- | --- | --- | --- |
| Claimant | Register frozen claim | `register_claim` | `0x8461be8fa84c22c62211695a15955466fc13567fd46cbd99ab2a036cca84049b` | `FINALIZED` / `MAJORITY_AGREE` / leader and agreeing receipts `SUCCESS` | Claim ID `1`; `get_claim(1)` confirmed exact result, commit, byte range, row identity, and fingerprint | `PASS` |
| Claimant | Register real Intel marketing claim | `register_claim` | `0x4e5a9951fc518896de82c0a394ec99b958be4655335a25a45dd0c263904215d5` | `FINALIZED` / `MAJORITY_AGREE` / leader and three agreeing receipts `SUCCESS` | Claim ID `2`; `get_claim(2)` confirmed exact source, result, commit, bytes, row identity, and fingerprint | `PASS` |
| Claimant | Register HPE mismatch control | `register_claim` | `0x4dd599e779834452c008062f7f08dc02384a249d534eb14ab33036bc9fe8a32c` | `FINALIZED` / `MAJORITY_AGREE` / leader and three agreeing receipts `SUCCESS` | Claim ID `3`; registry total `3`; exact result `6.0-0052`, commit, bytes `397144-398813`, HPE row identity, performance `6901.9`, and fingerprint `613ba3d2a675afe23156a0a73a918a11614dc39d49c53a030073098137646df6` | `PASS` |
| Verifier | Assess HPE mismatch control | `assess_claim` | `0x4f4a2f52cd4c38b1a0d92d31bacbb743c36c9fa8eb8129a9130047fe6b53713c` | `FINALIZED` / `MAJORITY_AGREE` / leader and three agreeing receipts `SUCCESS` | Assessment `4`: `OVERSTATED`, contradiction mask `1346`, other masks `0`; latest attempt/resolved `4`; history total `1` | `PASS` |
| Claimant | Register cross-system control | `register_claim` | `0x6ee41e02bbe8a347546ffe515cac21df91f9a9f5d712a332205caebaa2cdd4b4` | `FINALIZED` / `MAJORITY_AGREE` / leader and three agreeing receipts `SUCCESS` | Claim ID `4`; registry total `4`; exact result `6.0-0001`, commit, bytes `4-1438`, AMD row identity, performance `785522.0`, and fingerprint `94bffbf67fd65afaf89f9d3513ac52c4f4ddb508bf2bff931cc6cb3963f88713` | `PASS` |
| Verifier | Assess cross-system control | `assess_claim` | `0xc25d86585fb72be316037693ce6d3c6707a45de3175db4e95255053e8183f82a` | `FINALIZED` / `MAJORITY_AGREE` / leader and three agreeing receipts `SUCCESS` | Assessment `5`: `OVERSTATED`, contradiction mask `194142`, other masks `0`; latest attempt/resolved `5`; history total `1` | `PASS`; deterministic tests cover the other verdict boundaries |
| Claimant | Attempt dynamic HPE source registration | `register_claim` | `0xd581a7e0178123ff0673d23c4fb9db4e17688725feabee15b3eed6c8f47e4700` | `UNDETERMINED` / `MAJORITY_DISAGREE` | Registry remained total `4` with IDs `1-4` | `SAFE FAILURE`; not successful proof and not retried |
| Claimant | Register Intel comparative control | `register_claim` | `0x01d69cda52a1823cd3ace417da5d973a22e26abbfbd932dc5d2af43840aa9fa7` | `FINALIZED` / `MAJORITY_AGREE` / leader and three agreeing receipts `SUCCESS` | Claim ID `5`; registry total `5`; exact result `6.0-0101`, commit, bytes `748431-749749`, Intel B70 row identity, performance `1536.9`, and fingerprint `76142af892db5d421585c4e7819cdc380c777cdc28a7140abd07bc28f94b6d30` | `PASS` |
| Verifier | Assess Intel comparative control | `assess_claim` | `0x7415dc603a2e5c3855143a300f46278a77e722e5d32a5ce2249e2bcb86e451f6` | `FINALIZED` / `MAJORITY_AGREE` after one rotation / successful leader and agreeing receipts | Assessment `6`: `UNRESOLVED`; omission `33504`, incompatible `209`, uncertainty `38`; latest attempt `6`, latest resolved `null`; history total `1` | `PASS`; not retried, with all verdict boundaries covered deterministically |
| Verifier (frontend) | Assess Intel comparative control through wallet/provider UI and reconcile persisted pending state | `assess_claim` | `0x23f5dd67f82971118ecd49d2313619697f0716bdfce98f923e2da304cf9dceb7` | `FINALIZED` / `MAJORITY_AGREE` / successful leader and three agreeing receipts with state hash `0540e539a02908fec8a27bdff8d0272ebb2f9d0e7869c599e7f61de5819aff8f` | Assessment `7`: `UNRESOLVED`, masks `0/0/57/39`, prior attempt `6`; exact sender/claim/result/commit/range binding; latest attempt `7`; history `6, 7`; pending cleared without resubmission | `PASS` |
| Claimant | Attempt static-print HPE source registration | `register_claim` | `0x56f4c8f130fa03fba2f1687d19358d77204c0a87f9fe720a0dee31c4cad11c90` | `FINALIZED` / `MAJORITY_DISAGREE` after all rotations | Registry remained total `5` with IDs `1-5` | `SAFE FAILURE`; not successful proof and not retried |
| Verifier | Assess real Intel marketing claim | `assess_claim` | `0xe2a35f5e70b16d3733b14d968657b969632ad7d6ea0968c6455bf149b259de6b` | `FINALIZED` / `MAJORITY_AGREE` / leader and three agreeing receipts `SUCCESS` | Assessment `2`: `UNRESOLVED`; latest attempt `2`, latest resolved `null`, history total `1` | `PASS` |
| Verifier | Assess registered claim | `assess_claim` | `0x2e579575c34b3e38b8426ff18f85b190f57e3a042a50687706b93c267f529299` | `FINALIZED` / `MAJORITY_AGREE` / leader and agreeing receipts `SUCCESS` | Assessment `1`: `SUPPORTED`, all masks `0`; latest attempt/resolved `1`; history total `1` | `PASS` |
| Verifier | Replay resolved assessment | `assess_claim` | `0xa4c59f3bb5dcebff4758c1081dad7db65391e91ae30be07abaae80afffad8d2e` | `FINALIZED` / `MAJORITY_AGREE` / rollback `[EXPECTED] DUPLICATE_RESOLVED_REVISION` | Latest attempt/resolved remained `1`; outcome `SUPPORTED`; history total `1` | `EXPECTED REJECTION PASS` |
| Challenger | Retry unresolved assessment with exact same revision | `request_reassessment` | `0xd23b6aea888c8e309176aa88733ee412e423b82f8e39dbdf55a84f1175da99da` | `FINALIZED` / `MAJORITY_AGREE` / leader and three agreeing receipts `SUCCESS` | Assessment `3`: `UNRESOLVED`, prior attempt `2`; latest attempt `3`, latest resolved `null`; ordered history `2, 3` | `PASS` |
