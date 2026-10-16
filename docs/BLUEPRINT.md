# ACIE 3.0 — Technical Blueprint

> **Status:** Draft v1 · Sep 2026
> **Scope:** Product bet, target architecture, data model, risk model, phased roadmap
> **Preceded by:** `docs/GITHUB_APP_SETUP.md` (GitHub App wiring), code audit of Sep 2026

---

## 0. The one-sentence bet

**Close the loop no one has closed: every time main breaks, the engine learns — and the next PR is scored with your own failure history, proven by evidence, and gated by your rules.**

> **Vision vs. today (2026-10-05):** this is the long-term story, not a description of shipped software. Today's product is an **alpha**: deterministic dependency evidence on PRs, advisory only, TypeScript monorepos, no learned model yet. Keep the two visibly separate in all external copy.

Everyone else owns a fragment *(competitor rows corrected per external review, 2026-10-05)*:

| Player | Fragment they own |
|---|---|
| CodeRabbit ($143M) | Blast-radius *view* inside AI code review, **plus configurable pre-merge checks and a learnings feature** (their "learnings" ≠ incident-outcome model training — that narrower gap is what we pursue) |
| Koalr | Metadata-only 0–100 risk score as a blocking Check (reads **no source code**) *(claim not re-verified by external review)* |
| MergeShield | AI risk score pass/fail Check *(not re-verified)* |
| MergeGuard (OSS) | Blast radius + git-history "failure fingerprints" (hobby project) |
| Nova AI Ops | Post-merge incident → PR correlation, auto-rollback *(not re-verified)* |
| Mergify | Merge queues with **configurable priorities** — priority control is not *learned* risk ordering; **we integrate with queues rather than replace them** |
| GitHub native merge queue | "Is CI green?" — nothing else |

**Nobody ships: commit-specific dependency evidence × policy gate × risk-ordered queue advice × outcome-driven learning, in one system.**
*(Wording: "dependency evidence", not "semantic proof" — import edges + traversal show potential impact, not verified runtime breakage. On-prem deployability is a roadmap item until install/secrets/persistence/upgrade/recovery are tested.)*

### ICP (from Mergify's 2026 report — cohort ≈160 teams / 153k merges; directional, not universal rates)
- A green PR breaks main **1 in 8 times at 40+ devs** vs 1 in 130 at 2–5 devs *in that cohort* → target **~20–80-dev teams sharing monorepos** *(band is a hypothesis to validate)*.
- In the same sample, AI-authored PRs broke main less (1.9% vs 4.4%) → **do not** generalize to "AI code is safer" or equate broken-main with production incidents. The enemy is large, high-blast-radius change in big teams.

### Moat thesis
A feature is copyable in two weeks (Koalr shows it). The *potential* moat is **accumulated customer outcome data**: failures, rollbacks, incidents and their caused-by links, which could continuously train a per-customer risk model. GitHub has not shipped this because it requires the customer's own history across incidents and deploys — **but the advantage must be earned through accuracy, workflow adoption, and useful labels; it is not defensible by default.**

---

## 1. The four layers

```
 ┌─────────────────────────────────────────────────────────────────┐
 │ 4. LOOP     outcome data ──► model update ──► next PR score     │
 ├─────────────────────────────────────────────────────────────────┤
 │ 3. QUEUE    risk-ordered / risk-batched merge queue             │
 ├─────────────────────────────────────────────────────────────────┤
 │ 2. GATE     policy-as-code enforced as a blocking Check Run     │
 ├─────────────────────────────────────────────────────────────────┤
 │ 1. PROOF    evidence-backed blast radius (graph × tests ×       │
 │             owners × history) — every claim clickable           │
 └─────────────────────────────────────────────────────────────────┘
        ▲ all four read the same unified engine + data model
```

| Layer | What it delivers today (v1) | Why it's defensible |
|---|---|---|
| **1 PROOF** | Deterministic impact paths with per-claim evidence links | Trust story; on-prem/air-gapped buyers are a **roadmap** target until install, secrets, persistence, upgrade, and recovery are actually tested |
| **2 GATE** | `policy.yaml` → evaluated → blocking Check Run with exact remediation | Koalr gates on metadata; we gate on *dependency evidence* (affected paths, coverage delta, ownership) — ship **advisory** checks first, blocking only after customers trust the signal |
| **3 QUEUE** | Risk ordering/batching advice on top of GitHub's merge queue | Empty seat for *risk-ordered advice* (Mergify already has priority config — we integrate with queues rather than rebuild them) |
| **4 LOOP** | Outcomes (CI failures, rollbacks, incidents) → caused-by links → model update | Per-customer data accumulates; improves weekly; uncopiable |

**Flagship:** Layers 4 + 3 — *"The merge queue that learns from every break."*

---

## 2. Target architecture

### 2.1 What exists today (honest map)

Two **disjoint engines** that do not share code or data:

```
CLI (apps/cli)                          Webhook (apps/web/src/app/api/webhooks/analyze)
────────────────                        ─────────────────────────────────────────────
tree-sitter parse                       regex EXPORT_PATTERNS (route.ts:46-55)
  → nodes/edges in local SQLite           → GitHub code search for importers
  → BFS blast radius (blast-radius.ts)     (route.ts:115-146, max 6 searches)
  → risk scorer (risk-scorer.ts)         → in-memory BFS (lib/blast-radius.ts)
                                          → its OWN risk scoring (duplicated logic)
                                          → comment upsert + Turso analyses row
```

Problems: duplicate risk math (CLI `risk-scorer.ts` vs web `lib/blast-radius.ts`), webhook graph is heuristic (code-search substring), CLI graph never reaches the webhook, persistence broken (`storeAnalysis` SELECTs a `repos` table that is never created, route.ts:229-233), and the DB is mocked in CLI tests (which is how the boolean-bind crash survived).

### 2.2 Target

**One engine package, one data model, one risk model.**

```
packages/engine/            ← NEW (extracted from apps/cli + apps/web/src/lib)
  ├─ indexer/               tree-sitter incremental indexer (from CLI graph-builder)
  ├─ graph/                 symbol-level graph, BFS impact traversal
  ├─ evidence/              evidence joiner: impact × tests × owners × history
  ├─ scoring/               THE risk model (single source of truth)
  └─ policies/              policy DSL evaluation

apps/web/                   control plane (SaaS or self-hosted)
  ├─ /api/webhooks/*        delivery ingest → queue → engine → Check + comment
  ├─ /api/ci/*              status API for self-hosted runners / CI plugins
  └─ dashboard              real read APIs (today they are stubs)

apps/cli/                   thin runner over packages/engine (local/indexed mode)
```

**Analysis flow (target):**

```
GitHub webhook (pull_request / merge_group / deployment_status / check_run)
   │  HMAC fail-closed + delivery-ID dedup (webhook_deliveries table)
   ▼
Ingest API ──► job queue (retries, backoff, p95 budget)
   ▼
Engine:  graph lookup (pre-indexed repo graph) ──► impact BFS
         evidence join (coverage, CODEOWNERS/blame, history)
         scoring (deterministic base + per-customer weights)
   ▼
Outputs: ① Check Run (score, verdict, evidence links)   [GATE surface]
         ② PR comment (human summary, idempotent marker) [today's UX, kept]
         ③ analysis row (immutable record)               [dashboard + loop]
```

Key change vs today: **the webhook no longer discovers importers ad-hoc via code search.** The repo is continuously indexed (CLI or a server-side indexer), the webhook only queries the stored graph. Code search becomes a *fallback* for unindexed repos (current behavior kept as degraded mode).

### 2.3 Queue integration (Layer 3)

Do **not** rebuild queue mechanics. Compose with GitHub's native merge queue:

- Subscribe to `merge_group` events → score the group's combined diff (GitHub's own data shows per-PR green ≠ group green).
- Emit ordering/batch advice via Check Runs on the merge group; optionally block a risky group (`conclusion: action_required` + explanation).
- Phase 3b: independent queue mode (à la Mergify) for platforms without a native queue — only after the loop proves value.

---

## 3. Data model (Turso / libSQL)

Current state: `analyses` and `installations` are created inline inside request handlers; `users` is referenced by auth but **never created**; `repos` is referenced by the webhook but **never created**. Replace all ad-hoc DDL with versioned migrations (numbered SQL files, run at deploy + locally via `pnpm migrate`).

```sql
-- identity & tenancy
orgs            (id, name, slug, plan, created_at)
users           (id, org_id, github_id, login, avatar_url, role, created_at)   -- role: member|admin; NO implicit admin
sessions        (id, user_id, token_hash, expires_at, revoked_at)               -- httpOnly cookie sessions

-- installations & repos
installations   (id, installation_id UNIQUE, org_id, account_login, account_type,
                 permissions_json, created_at, updated_at)
repos           (id, org_id, installation_id, full_name, default_branch,
                 indexed_at, index_status, lang_stats_json, deleted_at)
                 UNIQUE(org_id, full_name)

-- analysis pipeline (append-only)
webhook_deliveries (delivery_id PRIMARY KEY, event, received_at, status, attempts,
                 last_error)                          -- IDEMPOTENCY: dedup on PK
analyses        (id, repo_id, delivery_id, pr_number, head_sha, base_sha,
                 pr_url, pr_title, pr_author,
                 risk_score, risk_level, verdict,       -- verdict: pass|warn|block
                 engine_version, weights_json,          -- reproducibility snapshot
                 changed_files_json, changed_symbols_json,
                 blast_radius_json, evidence_json,
                 check_run_id, comment_id,
                 created_at)
                 UNIQUE(repo_id, head_sha)              -- one analysis per commit

-- graph (server-side copy of the engine's store)
graph_nodes     (repo_id, path, symbol, kind, is_exported, loc, updated_at)
graph_edges     (repo_id, source_path, target_path, symbol, kind, updated_at)
                 PK(repo_id, source_path, target_path, symbol)
graph_indexes   (repo_id, commit_sha, status, node_count, edge_count, duration_ms, finished_at)

-- evidence
codeowners      (repo_id, pattern, team)                -- parsed CODEOWNERS snapshot
ownership       (repo_id, path, owner_login, score)     -- CODEOWNERS + git blame blend
coverage_map    (repo_id, path, covered_pct, test_paths_json, updated_at)
test_catalog    (repo_id, path, test_name, targets_json) -- which test covers which symbol

-- gate
policies        (id, repo_id, name, yaml, enabled, updated_at)
policy_evals    (id, analysis_id, policy_id, result, reasons_json, created_at)

-- loop (the moat)
outcomes        (id, analysis_id NULLABLE, repo_id, sha, kind,
                 -- kind: ci_failed | merge_group_failed | deploy_failed |
                 --       rollback | incident | hotfix_followup
                 source,           -- github_actions | merge_group | deployment | pagerduty | linear | manual
                 detected_at, details_json)
caused_by_links (outcome_id, analysis_id, confidence, method, created_at)
                 UNIQUE(outcome_id, analysis_id)
model_weights   (repo_id, key, value, samples, updated_at)
                 -- per-customer learned weights: path patterns, services, authors, change types
```

**Evidence JSON** (stored per analysis) is the contract that makes every score explainable:

```json
{
  "impacts": [{
    "path": "src/payments/charge.ts", "depth": 1,
    "via": { "symbol": "chargeCard", "from": "src/api/checkout.ts:42" },
    "tests": ["tests/checkout.test.ts"], "coverage": 0.61,
    "owner": "@payments-team",
    "history": { "past_failures": 2, "last_incident": "INC-142" }
  }],
  "signals": { "blastDepth": 3, "entrypoints": 1, "coverageDelta": -0.12,
               "churn": 0.7, "size": 483, "missingOwner": false },
  "model": { "version": "2026.09", "weights": { "...": 0.0 } }
}
```

---

## 4. Risk model v1

Design rule: **deterministic, explainable, reproducible** — `weights_json` stored per analysis, so any past score can be recomputed and audited (regulated buyers ask this).

```
score = clamp(0..100)

Base (from engine, same math CLI + web — kills the current duplication):
  0.35 × structural impact     (depth, fan-out, entrypoints touched, service count)
  0.20 × evidence gap          (impacted paths with no covering test / coverage drop)
  0.15 × ownership risk        (no CODEOWNERS match, absent owner, cross-team blast)
  0.10 × change shape          (size, churn, hot files, co-change coupling)
  0.20 × learned history       (per-customer: past failures for this path/service combo)

Applied AFTER the base score:
  +policy overrides            (hard rules: e.g. migrations → never auto-pass)
  → verdict:  pass (0–39) · warn (40–69) · block (70–100)   [thresholds per-repo]
```

**Layer-4 update rule (keep it boring):** Beta-Binomial updates per weight key (path pattern, service, author class, change type), updated when an outcome lands, capped samples to avoid overfitting, minimum sample threshold before a key influences the score. Phase 2 = this. No black-box ML until there is enough outcome volume to justify it; explainability is the product.

**Migration note:** the current CLI `risk-scorer.ts` (29 passing tests) becomes the seed implementation for `packages/engine/scoring`, then the web's `lib/blast-radius.ts` scoring is deleted. One model, tested once, used everywhere.

---

## 5. Policy DSL (Layer 2, v1)

```yaml
# .github/acie-policy.yml  (or org-level default)
version: 1
rules:
  - name: payments-require-owner
    when: { paths: ["src/payments/**"], services: ["payments"] }
    require: [owner-approval, tests-touched, coverage-not-dropped]
  - name: migrations-block
    when: { paths: ["**/migrations/**"] }
    verdict: block          # never auto-pass a schema change
  - name: large-pr-escalate
    when: { size_lines: ">500", impact_depth: ">2" }
    require: [second-approval]
    verdict: warn
```

Evaluation output → GitHub **Check Run** (`conclusion: success | neutral | failure`) with annotations pointing at exact files/lines and a "how to clear this" remediation block. Comments remain as the human summary; the Check is the enforcement surface.

---

## 6. The learning loop (Layer 4, the moat)

**Ingest (all via existing GitHub webhooks — no new auth surface):**
- `check_run` / `check_suite` failures on merge → `outcomes(kind=merge_group_failed)` (the Mergify insight: combined-diff failures are the real bug)
- `deployment_status` failure + rollback events → `outcomes(kind=rollback)`
- `workflow_run` failure on default branch → `outcomes(kind=ci_failed)`
- Phase 3: Linear/PagerDuty webhooks → `kind=incident`

**Caused-by linking:**
1. Candidate analyses = merged PRs whose `head_sha` appears in the failing deploy range (deployment API) — deterministic.
2. Rank candidates by structural proximity (impact path ∩ failure location when known, else blast score + file overlap).
3. Store `caused_by_links(confidence, method)`; low-confidence links go to a human triage queue (dashboard) rather than silently training the model.

**Effect visible to users (the "wow" moment):**

```
⚠ Risk 87 — BLOCKED
This exact pattern (auth/session changes in charge.ts co-change set) caused
2 CI failures and INC-142 in the last 90 days. → see evidence
To clear: owner approval + run tests/checkout.test.ts + coverage on charge.ts ≥ 0.8
```

---

## 7. Definition of "works perfectly"

| # | SLO / bar | Today |
|---|---|---|
| 1 | Webhook → Check Run posted **p95 < 10s** for indexed repos | n/a (no Checks today) |
| 2 | **100% idempotent** under GitHub redelivery (delivery dedup) | ❌ redeliveries duplicate rows |
| 3 | Full index of a 100k-file repo **< 10 min**; per-PR update **< 30s** | CLI re-parses everything |
| 4 | Every score **reproducible** from stored `weights_json` + `evidence_json` | ❌ two divergent scorers |
| 5 | Zero silent failures: no bare `catch {}` in prod paths (grep currently finds ~everywhere) | ❌ swallowed errors |
| 6 | Zero fabricated data in UI (today: "98.4% integrity", "AGENTS ONLINE") | ❌ fake metrics |
| 7 | Integration tests run against a **real DB** (not mocked) + webhook fixture corpus | ❌ DB mocked in CLI tests |
| 8 | `pnpm lint`, `pnpm typecheck`, `pnpm test`, CI in `.github/workflows/` all actually run | ❌ lint is a no-op, CI misplaced |
| 9 | Fail-closed webhook HMAC in production; no default admin roles; httpOnly sessions + middleware | ❌ fails open, `role='admin'` for all |
| 10 | Migration system replaces inline `CREATE TABLE` in request handlers | ❌ ad-hoc DDL in handlers |

---

## 8. Phased roadmap

### Phase 0 — Trust the base (1–2 weeks)
*Prerequisite for every later layer.*
- Rotate leaked JSONBin key (in git history); delete legacy root `api/`, `archive/`, `vercel.backup.json`, junk files; untrack `.next/`
- Webhook: fail-closed HMAC, delivery dedup, remove raw-error 500s, bounded redelivery handling
- Auth: httpOnly cookie sessions, `middleware.ts`, remove default `admin`, fix `//evil.com` redirect, lock down unauthenticated setup endpoint
- Migrations: real `users`/`repos`/`analyses`/`installations` tables; kill inline DDL
- CLI: fix boolean-bind crash (`apps/cli/src/utils/db.ts:120`), tsconfig-root fix (`graph-builder.ts:83,127`)
- Tooling: `typecheck` + real `lint` scripts wired to `packages/config/eslint-config`; CI moved to `.github/workflows/ci.yml` running build+lint+typecheck+test
- Remove all fake UI metrics; wire or delete dead dashboard components

**Exit criteria:** all Definition-of-Perfect items 2, 5, 6, 8, 9, 10 green.

### Phase 1 — One engine, real product (3–5 weeks)
- Extract `packages/engine`; both CLI and webhook use it; delete duplicated scoring from `lib/blast-radius.ts`
- Server-side indexing: `graph_indexes` pipeline (CI action or app-side fetch), webhook queries stored graph (code search = fallback only)
- Implement the stubbed read APIs (`/api/repos`, `/api/analysis`, `/api/dashboard/overview`) + fix the 3 data-shape mismatches (`repo_name`, `changed_files` objects, `impacted_services` array)
- Evidence join v1: CODEOWNERS parse, git-blame ownership, coverage ingestion (from CI reports), test catalog
- Post **Check Runs** (score + evidence) alongside the existing comment
- Multi-tenant authz: every query org-scoped; dashboard shows real data

**Exit criteria:** SLOs 1, 3, 4, 7 green; a design-partner repo shows real analyses end-to-end.

### Phase 2 — Flagship: GATE + LOOP (4–8 weeks)
- Policy DSL + evaluation + blocking annotations with remediation
- Outcome ingestion (check_run, deployment_status, workflow_run) + caused-by linking + triage UI
- `model_weights` v1 (Beta-Binomial per-customer weights) feeding `learned history` term
- Risk verdicts in Check Runs; repo-level thresholds

**Exit criteria:** one partner turns on a blocking policy; the system demonstrably links at least one real broken-main event to the responsible analysis and shifts subsequent scores.

### Phase 3 — QUEUE + moat (then)
- `merge_group` scoring: risk-ordered/batched advice; block risky combined diffs
- Cross-repo contract impact (OpenAPI/proto/event schemas)
- GitLab/Bitbucket connector; self-hosted Docker install (already scaffolded in `infra/docker/`)
- SSO, audit log, SOC 2 evidence exports, billing

**Exit criteria:** the flagship demo — *a merge group blocked with "this combination broke main last quarter," then cleared by remediation* — works on a partner's repo.

---

## 9. Validation (parallel, before Phase 2 commitment)

10 interviews with platform/eng leads at 15–100-dev orgs; test in this order:
1. "Show me your last incident caused by a PR — how did you find out?" (pain check)
2. Show the proof-carrying blast radius → "would you block merges on this?" (gate appetite)
3. Show the loop mock → "would you connect your incident tool?" (moat check)
4. Price probe: per-repo/mo vs per-seat.

Kill/keep: if nobody enables a blocking gate, sell Layer 1 as trust/compliance tooling instead; if the loop feels creepy, ship score explanations without auto-learning.

---

## 10. Explicit non-goals

- LLM-only scoring (Koalr/MergeShield own that shallow end; we are evidence-first — LLMs may *narrate* evidence, never *be* the score)
- "AI-generated PRs are dangerous" positioning (contradicted by Mergify's data)
- Any Supabase/legacy path — `supabase_schema.sql` and root `api/` are deleted in Phase 0
- Rebuilding queue mechanics before the loop has proven value
- More UI skins / fabricated metrics — ever

---

## Appendix A — Phase 0 concrete fix list (file references from audit)

| Area | Fix | Location |
|---|---|---|
| Secret | Rotate JSONBin key from git history | old `api/github.js` commits |
| Repo | Delete `api/`, `archive/`, `vercel.backup.json`, `test.txt`, `files.txt`, `structure.txt`, `ersshaikacieacie`, `skills-lock.json`; `git rm --cached .next/*` | root |
| Webhook | Fail-closed HMAC + delivery dedup | `apps/web/src/app/api/webhooks/analyze/route.ts:311-320` |
| Webhook | Stop SELECT on never-created `repos` table | same file `:229-233` |
| Auth | httpOnly sessions, middleware, no default admin, redirect allowlist | `auth/github/route.ts:115,132`, `login/page.tsx:50` |
| CLI | Boolean → 0/1 bind; tsconfig root path | `apps/cli/src/utils/db.ts:120`, `graph-builder.ts:83,127` |
| Tooling | `typecheck`/`lint` scripts; CI to `.github/workflows/` | `apps/*/package.json`, `infra/github/workflows/ci.yml` |
| UI | Remove fake metrics; implement or remove stub APIs | `sidebar.tsx:66`, `header.tsx:30`, `api/{repos,analysis,dashboard}/*` |

## Appendix B — Current vs target engine

| Concern | Today (webhook) | Today (CLI) | Target |
|---|---|---|---|
| Parsing | regex | tree-sitter | tree-sitter (engine pkg) |
| Importer discovery | GitHub code search ×6 | stored graph | stored graph, search as fallback |
| Scoring | `lib/blast-radius.ts` (own math) | `risk-scorer.ts` (own math) | `packages/engine/scoring` — one |
| Storage | Turso, ad-hoc DDL | local SQLite | Turso + migrations (SQLite for local mode) |
| Tests | webhook fixtures (12) | unit, DB **mocked** | integration against real DB |
