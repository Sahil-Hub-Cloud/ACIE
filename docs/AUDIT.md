# ACIE — Complete Application Audit
**Date:** 2026-10-05 · **Repo:** `D:\ACIE\ACIE` · **HEAD:** `76cfb3d` (main, == origin/main) · **Scope:** everything in the working tree, including uncommitted Phase 0 work

---

## Part 1 — The Problem We Solve

### 1.1 Problem statement
> "See what your code breaks **before** you merge." — every merged PR is a roll of the dice: a developer changes a utility file, 47 downstream services break, production goes down at 2 AM.

Formally (`docs/BLUEPRINT.md:11`): *close the loop no one has closed — every time main breaks, the engine learns, and the next PR is scored with your own failure history, proven by evidence, and gated by your rules.*

### 1.2 Why this is a real gap (competitive landscape — corrected per external review 2026-10-05)
Each competitor owns only a fragment. **Correction notes mark claims the external reviewer verified or refuted:**

| Competitor | What they do | What they lack |
|---|---|---|
| CodeRabbit | blast-radius *view* in AI code review **+ configurable pre-merge checks (custom checks, enforcement modes) + a learnings feature** | ⚠️ **corrected:** earlier "no gate, no learning" was wrong — their "learnings" still ≠ incident-outcome model training, but the blanket claim is withdrawn |
| Koalr | metadata-only 0–100 score | **reads no source code** *(not re-verified by external review)* |
| MergeShield | pass/fail check | no inspectable evidence *(not re-verified by external review)* |
| MergeGuard | OSS hobby project | — |
| Nova AI Ops | post-merge incident correlation | no PR-time scoring *(not re-verified by external review)* |
| Mergify / GH queues | merge queues **with configurable priorities** | priority control ≠ *learned* risk ordering — **integrate with queues, don't claim to replace them** |
| GitHub native merge queue | "is CI green?" | no dependency evidence |

**White space we pursue:** commit-specific **dependency evidence** × policy gate × risk-ordered queue *advice* × outcome learning.
⚠️ **Wording correction:** the earlier "semantic proof" claim is withdrawn — import matches + BFS establish *potential* dependency relationships, not proof of runtime breakage. Use "dependency evidence" / "potential impact" unless a compiler/test demonstrates a specific failure.

### 1.3 Who we build for (ICP)
- **~20–80-dev teams sharing monorepos** *(team-size band is a hypothesis to validate, not established)* — per Mergify's 2026 report *(cohort ≈160 teams / 153k merges — directional, not universal rates)*, a green PR breaks main **1 in 8 times at 40+ devs** vs 1 in 130 at 2–5 devs.
- In *that same sample*, AI-authored PRs broke main less (1.9% vs 4.4%) → **do not** generalize to "AI code is safer", and never equate broken-main with production incidents. The enemy is large, high-blast-radius change in big teams.

### 1.4 The moat
Features are copyable in 2 weeks; the moat is **accumulated per-customer outcome data** (failures, rollbacks, incidents + caused-by links) that a code host can never ship, because GitHub doesn't see your incident/deploy history.

### 1.5 Four-layer product architecture (the vision)
1. **PROOF** — evidence-linked blast radius on every PR
2. **GATE** — `policy.yaml` → blocking GitHub Check Run
3. **QUEUE** — risk-ordered/batched advice on top of GitHub's queue
4. **LOOP** — outcomes → caused-by links → model update

All four must read **one unified engine + data model**. Today only Layer 1's core (blast radius + PR comment) exists, in two divergent copies.

---

## Part 2 — What We Built

```
ACIE/
├── apps/
│   ├── web/          Next.js 14 App Router — dashboard + ALL API route handlers + webhook
│   └── cli/          Node CLI (`bie`) — local indexer + local analyzer + local API server
├── packages/
│   ├── shared/       @acie/shared TypeScript types (currently used by CLI only!)
│   └── config/       @cie/eslint-config + @cie/typescript-config
├── infra/docker/     Dockerfile.web + docker-compose.yml (web service only)
├── .github/workflows/ci.yml   CI (build → lint → typecheck → test)  [untracked, never ran]
├── docs/             BLUEPRINT.md (product spec) + GITHUB_APP_SETUP.md + AUDIT.md (this file)
└── vercel.json       Production deploy → acie-gamma.vercel.app
```

### 2.1 The three deliverables
| Deliverable | What it is | State |
|---|---|---|
| **Webhook analysis engine** | GitHub webhook → verify → diff analysis → blast radius → risk score → PR comment → DB row | **REAL, end-to-end** |
| **Dashboard** | Landing/login + 4 dashboard pages + auth system | Auth **REAL**; data pages **UI-complete but backed by stub APIs** |
| **CLI (`bie`)** | `init / index / analyze / serve` — local dependency graph + local blast-radius report | **REAL in dev (tsx), broken in shipped binary** (see §10.1) |

---

## Part 3 — How It's Built (Tech Stack)

| Layer | Technology | Why / notes |
|---|---|---|
| Monorepo | **pnpm 10 workspaces + Turborepo 2** | task graph: build → lint → typecheck → test |
| Web framework | **Next.js 14.2 (App Router)**, React 18 | API routes replace the old NestJS backend (commit `1c4c1c7`) |
| Styling | Tailwind CSS 3.4, custom glass/dark theme | |
| Graph visualization | **@xyflow/react (React Flow)** — `dependency-graph.tsx` | 4-column grid layout, entry badges |
| State | **zustand** stores (`use-repos`, `use-analysis`) | no React Query/SWR — manual `useEffect` fetches |
| Database | **Turso / libSQL** via `@libsql/client/web` | serverless-friendly; graceful no-DB degradation |
| Migrations | `src/lib/migrations.ts` — versioned `0001_init`, lazy-applied once/process, tracked in `schema_migrations` | replaces old inline `CREATE TABLE` DDL |
| Auth | GitHub OAuth → **HS256 JWT in httpOnly `acie_session` cookie**; `jsonwebtoken` (Node) + Web Crypto (Edge middleware) | 7-day expiry, SameSite=Lax, Secure in prod |
| GitHub integration | **GitHub App** (RS256 app JWT, installation tokens, 60s cache) with PAT (`GITHUB_TOKEN`) fallback | `src/lib/github-app.ts` |
| Webhook security | HMAC-SHA256 over raw body, `timingSafeEqual`, **fail-closed 503 in production when secret unset**, delivery-ID dedup with stale-claim reclaim | `api/webhooks/analyze/route.ts` |
| CLI runtime | commander, ora, chalk, simple-git, **glob** | |
| CLI parsing | **tree-sitter + tree-sitter-typescript** (AST) with **regex fallback** | bundled by tsup → broken in dist (§10.1) |
| CLI storage | **better-sqlite3** (WAL), local `./data/acie.db` | separate from web's Turso — two disjoint stores |
| Tests | **vitest** — 45 CLI + 20 web = **65 tests** (exact `pnpm test` output, 2026-10-05; count from one pinned commit + CI going forward, not hand-tallied) | DB mocked in web tests |
| Lint/Types | eslint 8 + @typescript-eslint 6 (warnings-first config), `tsc --noEmit` typecheck per package | |
| CI | GitHub Actions: install → build → lint → typecheck → test | file exists, **never committed → never ran** |
| Deploy | Vercel (root `vercel.json`), Docker (single-stage web) | two conflicting vercel.json files (§10.6) |

**Required env vars** (see `.env.example`): `JWT_SECRET`, `GITHUB_CLIENT_ID/SECRET`, `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_WEBHOOK_SECRET`, `GITHUB_TOKEN` (fallback), `TURSO_DATABASE_URL/AUTH_TOKEN`, optional `NEXT_PUBLIC_API_URL`, `GITHUB_APP_SLUG`, `GITHUB_OAUTH_REDIRECT_URI`.

---

## Part 4 — Complete Feature Walkthrough (Login → End)

### 4.1 A. Authentication journey ✅ REAL

| Step | Where | What happens |
|---|---|---|
| 1 | `app/page.tsx` (landing) | Visitor clicks **Sign In / ADD TO GITHUB** → `/login`. If already signed in (`me()` succeeds) → auto-redirect `/repos`. |
| 2 | `(auth)/login/page.tsx:66` | **Sign in with GitHub** button → `window.location.href = '/api/auth/github/authorize'` |
| 3 | `api/auth/github/authorize/route.ts` | `safeNext()` validates destination (blocks `//evil.com`, `\`) → builds `github.com/login/oauth/authorize` URL with `state = nonce:encodedNext` → sets **httpOnly `acie_oauth_state` nonce cookie** (10 min) → redirects to GitHub |
| 4 | GitHub | User approves; GitHub redirects back to `GITHUB_OAUTH_REDIRECT_URI` (default `{origin}/login`) with `?code=&state=` |
| 5 | `login/page.tsx:40` | `ApiClient.login(code, state)` → `POST /api/auth/github` |
| 6 | `api/auth/github/route.ts` | Verifies state nonce vs cookie (CSRF) → exchanges code for access token → fetches `/user` → upserts `users` row (role defaults to **`developer`**, never admin) → signs 7d HS256 JWT → returns `{user}` + **httpOnly `acie_session` cookie** (no token ever exposed to JS) |
| 7 | `login/page.tsx:47-58` | Re-validates the `next` from state (same-origin only) → `router.replace('/repos')` |
| 8 | `src/middleware.ts` | Protects `/repos/*, /analysis/*, /graph/*, /settings/*`: reads cookie → **Edge Web-Crypto HS256 verify** (alg pinning, constant-time compare, exp check) → valid: pass through; invalid: delete cookie + redirect `/login` |
| 9 | `components/layout/header.tsx` | Fetches `GET /api/auth/me` (cookie or Bearer) → avatar/username chip |
| 10 | Logout | Sidebar **Logout** → `POST /api/auth/logout` (clears cookie) → `/login` |

**Also real:** `GET /api/auth/status` (config introspection shown on Settings — never leaks secrets), `GET /api/auth/github/install` (redirects to App installation), landing-page silent auth check.

### 4.2 B. GitHub App installation ✅ REAL (needs App env)

1. `/api/auth/github/install` → `https://github.com/apps/{slug}/installations/new`
2. GitHub redirects to **Setup URL** → `/api/auth/github/setup?installation_id=&setup_action=`
3. Setup route **verifies by minting an installation token with the app JWT** — unverified requests are rejected (`?setup=unverified`) → reads `/installation/repositories` (account, repo count) → upserts `installations` → redirects `/repos?setup=ok&installation_id=&repos=N`
4. Webhook `installation` / `installation_repositories` events upsert the same table (marks `uninstall` on delete)

### 4.3 C. PR analysis journey (the core product) ✅ REAL

Trigger: PR `opened` / `synchronize` / `reopened` → GitHub POSTs to **`/api/webhooks/analyze`** (`maxDuration = 60s`).

| # | Stage | Detail (file:line) |
|---|---|---|
| 1 | **Raw body read once** | `route.ts:349` — must precede parsing |
| 2 | **Signature verify** | HMAC-SHA256 vs `x-hub-signature-256`, `timingSafeEqual` (`:27-36`). Secret set → verify (401 on mismatch). Secret unset → **production: 503 fail-closed**; dev: warn + accept. |
| 3 | **JSON parse** | 400 on malformed |
| 4 | **Delivery dedup** | `webhook_deliveries` claim (`INSERT … ON CONFLICT DO NOTHING`); `completed`/in-flight → return `duplicate:true`; `failed` or **stale >10 min** → reclaim with `attempts+1`. Settled `completed` on status<500, `failed` otherwise. Claim failure ⇒ process anyway ("better a duplicate than a dropped delivery"). |
| 5 | **Event routing** | `ping` → zen echo · `installation*` → store · non-PR → ignored · action not in `{opened,synchronize,reopened}` → ignored · incomplete payload → ignored |
| 6 | **Credential check** | GitHub App **or** `GITHUB_TOKEN` else 503 · `resolveRepoToken()` = known install → app-derived install → PAT fallback |
| 7 | **Fetch changed files** | 3 pages × 100 = up to 300 files; filter `SOURCE_FILE = ts/tsx/js/jsx/mjs/cjs/py/go/rb/java/kt`. Zero source files → ignored |
| 8 | **Diff → changed symbols** | `analyzePatch()` scans `-`/`+` lines against 9 export patterns (function/class/interface/type/const/enum + Python `def` + Go `func`) → `removed` / `added` / `modified`; body-only edits → wildcard `*` |
| 9 | **Importer discovery** | `findImporters()` — **GitHub code search** `repo:{full} "{basename}" in:file`, capped at 6 searches × 30 results, skips already-changed files → `GraphEdge[]` |
| 10 | **Blast radius BFS** | `calculateBlastRadiusInMemory()` (`lib/blast-radius.ts:113-204`): seed changed files at depth 0 → reverse-importer BFS → **MAX_DEPTH 10** → entry-point detection (10 patterns) → service grouping (`apps/x`, `features/x`, `modules/x`, `src/x`, else `core`) |
| 11 | **Risk score** | See §6 — 0–100 with `low/medium/high/critical` |
| 12 | **Recommendations** | Conditional: removed exports, modified exports, entry points, >2 services, high/critical → senior review + feature flags; else fallback |
| 13 | **PR comment (submit)** | `upsertPrComment()` lists 100 comments → finds `<!-- acie:blast-radius -->` marker → **PATCH existing** (no duplicates) else **POST new**. Comment failure never loses the analysis. Skipped under `?dryRun=1`. |
| 14 | **Persist (verification record)** | `storeAnalysis()` upserts `analyses` on `UNIQUE(repo_full_name, pr_number, head_sha)` with JSON: changed_files, changed_symbols, impacted_services, blast_radius, recommendations |
| 15 | **Response** | `{ok, riskScore, riskLevel, changedFiles, impactedFiles, impactedServices[], entryPointsAffected, comment:'created'|'updated'|'skipped', commentPreview?}` — generic `Internal error processing webhook` on 500 (details logged server-side) |

**The submitted PR comment** (reconstructed from `formatPRComment`, `lib/blast-radius.ts:276-302`):

````markdown
<!-- acie:blast-radius -->
## ⚡ ACIE Blast Radius Report — PR #7

![Risk Level](https://img.shields.io/badge/Risk-MEDIUM-ff8800?style=for-the-badge)
![Score](https://img.shields.io/badge/Score-49%2F100-ff8800?style=for-the-badge)

### ⚠️ Risk Assessment
| Metric | Value |
|--------|-------|
| Risk Score | **49/100** |
| Risk Level | **MEDIUM** |
| Changed Files | 1 |
| Impacted Files | 1 |
| Impacted Services | 1 |
| Entry Points Affected | ⚠️ Yes |

### 📦 Impacted Services
  - **api** (1 entry points)

### 🔗 Dependency Chain (top 10)
    - `apps/api/src/routes/login.route.ts` (depth: 1)

### 💡 Recommendations
- ⚠️ Removed exports: `formatDate`. All downstream importers will break.
- 📋 Run `acie analyze` to find all files that import these symbols.
- 🚨 Entry points (routes/controllers) are in the blast radius — runtime behavior may change.
- 🧪 Run integration tests against all affected endpoints.

---
<sub>Generated by [ACIE](https://github.com/Sahil-Hub-Cloud/ACIE) — AI Change Impact Engine</sub>
````

Badge colors: `critical ff0000 / high ff4444 / medium ff8800 / low 00cc44`. Emoji: `🚨/🔴/⚠️/✅`. Health check: `GET /api/webhooks/analyze` → `{status, version:'2.1', signatureVerification, githubApp, patFallback}`.

### 4.4 D. Dashboard verification journey (viewing results) ⚠️ UI REAL / DATA STUB

| Page | UI built | Data source | State |
|---|---|---|---|
| `/repos` | Register Repo form, filter, card grid, Sync/Delete buttons | `GET /api/repos` → **`[]`** | **STUB** — always empty; `POST /api/repos` → 405, `{id}/index` & DELETE → 404. Form even submits `githubId: Math.floor(Math.random()*1e6)` (fabricated ID). |
| `/repos/[id]` | Header, KPI tiles (Indexed Symbols, Import Connections), React Flow graph | `GET /api/repos/{id}` + `/graph` → **routes don't exist** | **STUB** — always error state |
| `/analysis` (Audit Logs) | Table, search, 5 risk filter chips, RiskScoreBadge, row links | `GET /api/analysis` → **`[]`** | **STUB** — always "No matching analysis audit records found", *even though the webhook writes real rows* |
| `/analysis/[id]` | PR header, recommendations checklist, changed-file list, `BlastRadiusView` | `GET /api/analysis/{id}` → **route doesn't exist** | **STUB** — always error. Also has a latent shape mismatch (page expects objects, webhook stores JSON strings). |
| `/graph` | Repo selector + React Flow canvas | `GET /api/repos` → `[]` | **STUB** — always empty state |
| `/settings` | Identity, DB/Session/OAuth/Webhook status pills, CLI helpers | `me()` + **`GET /api/auth/status` (real)** | **REAL** (read-only) |

**The central product gap:** the webhook **writes** real analyses to Turso, but no API ever **reads** them back — the dashboard is walled off from the only real data in the system. This is Blueprint Phase 1 work ("implement the stubbed read APIs"), not an accident — but today the README claim "Results appear in the dashboard" is false.

**7 client endpoints the UI calls that don't exist:** `/api/repos/{id}` (GET/DELETE), `/api/repos/{id}/index`, `/api/repos/{id}/graph`, `/api/analysis/{id}`, `/api/analysis/stats`, `/api/analysis/preview`. Nothing anywhere writes `INSERT INTO repos`.

### 4.5 E. CLI journey (`bie`) ✅ REAL (dev mode)

```
bie init                    # writes .acie.json (never read again), appends data/ to .gitignore
bie index [root]            # glob 6 extensions → tree-sitter AST (or regex) → nodes+edges in SQLite
bie analyze -b main -h HEAD # git diff → changed exports → BFS blast radius → printed report → analyses row
bie serve -p 3002           # local HTTP API: GET /api/graph, /api/analyses, /api/analyses/:id
```

- **index**: wipes `nodes`/`edges` (no transaction, no root scoping), parses per file, flushes batches of 50 in transactions, `--stats` prints counts. Spinner: `Found N source files → Parsed N/M → Graph built! X symbols, Y import edges.`
- **analyze**: `git diff base...head --name-status` (three-dot) for file list but `git diff base head` (two-dot) for patches; extracts changed exports (8 patterns incl. Python/Go); BFS; prints the **BLAST RADIUS REPORT** block (risk level emoji, score `/100`, changed/impacted files, services, dependency chain top 5, recommendations); persists to SQLite.
- **Reports nothing if the graph was never indexed** — empty DB silently yields `0/low`.
- Local SQLite and web Turso are **disjoint stores** — CLI results never appear in the dashboard.

---

## Part 5 — Complete Feature Inventory

### ✅ REAL (works end-to-end)
1. Landing page + marketing flow
2. GitHub OAuth login with CSRF state nonce → httpOnly session cookie
3. Edge middleware route protection (HS256, alg-pinned, exp-checked)
4. `/api/auth/me`, `/logout`, `/status`, `/authorize`, `/install`, `/setup` (verified installation)
5. GitHub App JWT + installation-token cache + PAT fallback (`github-app.ts`)
6. **Webhook pipeline**: HMAC fail-closed verify → dedup → PR file fetch → patch analysis → code-search importers → BFS blast radius → risk score → recommendations
7. **Idempotent PR comment** upsert via `<!-- acie:blast-radius -->` marker
8. **Analysis persistence** with `head_sha` upsert (unique index)
9. Installation event tracking
10. Settings page config introspection
11. CLI `init/index/analyze/serve` (via `tsx` dev mode)
12. Risk scorer + blast radius unit tests + parser/graph-builder tests (45 CLI tests)
13. Webhook + middleware tests (20 web tests)
14. Migrations (versioned, lazy, concurrent-safe)
15. Quality gates: `pnpm build/lint/typecheck/test` all green

### ⚠️ PARTIAL
16. Dashboard pages — full UI, empty states, loading/error handling, but stub data
17. Repo registration form — submits to a 405 route with a random GitHub ID
18. Repo card "Sync Graph" — spins 2s regardless of outcome, hits 404
19. Webhook dedup logic — implemented but untestable in vitest (DB mocked) — review-only confidence
20. Python/Go support — diff analyzer understands them; **graph builder extracts zero symbols** for them
21. `@cie/shared` types — used by CLI only; web duplicates everything 3 more times
22. Lint — runs and passes, but config is shallow (eslint:recommended only, `any` = warn)

### ❌ STUB / MISSING / BROKEN
23. `GET /api/repos`, `/api/analysis` → hardcoded `[]`; `/api/dashboard/overview` → zeros (dead code, `recharts` unused)
24. 7 client endpoints return 404/405 (§4.4)
25. **Shipped CLI binary (`dist/index.js`) can't open its DB** — tsup bundles `better-sqlite3`/`tree-sitter` native deps → "Could not locate the bindings file"; also silently falls back to regex-only parsing (§10.1)
26. **AST parser bugs (verified by execution)**: `export function/class` recorded **twice**; `export const` produces **no symbol**; `export {x} from` produces **no edge** (§10.2)
27. No Check Runs, no policy gate, no merge-queue, no outcome loop (Blueprint Layers 2–4 — Phase 2+)
28. No incremental indexing (`updateFileInGraph` dead), no symbol-level edges (only `imports`; `calls|extends|implements` never produced)
29. `.acie.json` config written but never read; `formatPRComment` in CLI never called by any command

---

## Part 6 — The Scoring Engine (exact math)

### 6.1 Formula (identical in `apps/cli/src/core/risk-scorer.ts:18-59` and `apps/web/src/lib/blast-radius.ts:80-95` — duplicated)

```
score = (entryPointsAffected ? 35 : 0)
      + min(impactedServicesCount × 10, 30)
      + min(maxDepth × 2, 10)
      + min(impactedFilesCount × 1, 20)
      + min(changedSymbolsCount, 5)
score = min(score, 100)          # max possible = 35+30+10+20+5 = 100
```

| Level | Threshold |
|---|---|
| critical | ≥ 76 |
| high | ≥ 51 |
| medium | ≥ 26 |
| low | ≤ 25 |

### 6.2 Entry-point patterns (10)
`*.controller.ts|js`, `*.route.ts|js`, `pages/**/*.{ts,tsx,js,jsx}`, `app/**/page.{ts,tsx}`, `app/**/route.{ts,js}`, `server.{ts,js}`, `main.{ts,js}`, `index.{ts,js}`, `handler.{ts,js}`, `lambda.{ts,js}`.
⚠️ `index.ts` matches **anywhere** — `src/utils/index.ts` counts as an entry point.

### 6.3 Service detection (first match wins)
`apps|packages/<name>/` → `features/<name>/` → `modules/<name>/` → `src/<name>/` → `core`.

### 6.4 Blast-radius BFS
- Seeds: changed files at depth 0 (excluded from the chain/count)
- Traversal: FIFO BFS over **reverse file-level import edges** (`SELECT source_file FROM edges WHERE target_file = ?`)
- `MAX_DEPTH = 10` (depth-10 nodes counted but not expanded)
- Symbols ride along as labels — **traversal is file-level**, not symbol-level
- `trafficPerHour` hard-coded `0 // Would be populated from traffic fetcher`

### 6.5 Recommendations logic
removed exports → ⚠️+📋 · modified → 🔄 · entry points → 🚨+🧪 · >2 services → 📦 · high/critical → 👥+🔀 · else ✅ fallback (always ≥1 item).

### 6.6 Divergence from the documented future model
Blueprint v1 (`docs/BLUEPRINT.md:212-225`) specifies `0.35 structural + 0.20 evidence gap + 0.15 ownership + 0.10 change shape + 0.20 learned history` with verdicts `pass 0–39 / warn 40–69 / block 70–100` and `weights_json` snapshots. **None of that is implemented** — only the v0 formula above exists, in two copies (plus a third re-hard-coded copy in `logger.ts` thresholds and a fourth inside the test mock).

---

## Part 7 — Data Model

### 7.1 Web (Turso/libSQL) — `apps/web/src/lib/migrations.ts`
| Table | Purpose | Key columns |
|---|---|---|
| `schema_migrations` | migration ledger | `id PK`, `applied_at` |
| `users` | OAuth identities | `github_id UNIQUE`, `username`, `role DEFAULT 'developer'` |
| `repos` | registered repos (**never written by anything**) | `full_name UNIQUE`, `installation_id`, `index_status`, `indexed_at` |
| `installations` | GitHub App installs | `installation_id UNIQUE`, `account_login`, `repository_count`, `setup_action` |
| `analyses` | **the product's output** | `repo_full_name + pr_number + head_sha` **UNIQUE** upsert target; `risk_score/level`, 5 JSON columns |
| `webhook_deliveries` | idempotency | `delivery_id PK`, `status processing/completed/failed`, `attempts`, `last_error` |

### 7.2 CLI (better-sqlite3, `./data/acie.db`) — `apps/cli/src/utils/db.ts`
`nodes` (file_path, symbol_name, symbol_kind, line_number, is_exported) · `edges` (source_file, target_file, edge_type='imports') · `analyses` (12 cols, JSON strings) · `repos`/`users`/`services` (schema present, **never read/written**) · 9 indexes · **no UNIQUE constraints anywhere** → `INSERT OR IGNORE` never actually dedupes.

**The two databases never talk to each other.**

---

## Part 8 — API Surface

| Route | Methods | Status |
|---|---|---|
| `/api/webhooks/analyze` | GET (health), POST | ✅ REAL |
| `/api/auth/github` | POST (code exchange) | ✅ REAL |
| `/api/auth/github/authorize` | GET | ✅ REAL |
| `/api/auth/github/install` | GET | ✅ REAL |
| `/api/auth/github/setup` | GET | ✅ REAL (verified) |
| `/api/auth/me` | GET | ✅ REAL |
| `/api/auth/logout` | POST | ✅ REAL |
| `/api/auth/status` | GET | ✅ REAL |
| `/api/repos` | GET only | ⚠️ STUB `[]` (UI also POSTs → 405) |
| `/api/analysis` | GET only | ⚠️ STUB `[]` |
| `/api/dashboard/overview` | GET | ⚠️ STUB zeros (dead — never called) |
| `/api/repos/{id}`, `/{id}/graph`, `/{id}/index` | — | ❌ missing (404) |
| `/api/analysis/{id}`, `/stats`, `/preview` | — | ❌ missing (404) |

CLI `bie serve`: `GET /api/graph`, `/api/analyses`, `/api/analyses/:id` — raw rows, JSON columns come back as **strings**, 500s leak raw error messages, CORS `*`.

---

## Part 9 — Security Posture (post-Phase-0)

### ✅ Implemented
- Webhook **fail-closed HMAC** in production; constant-time compare on raw body
- Delivery-ID **idempotent dedup** with stale-claim recovery
- **httpOnly session cookie** — token never touches JS/localStorage; legacy localStorage keys cleared
- **Edge middleware** HS256 verify with `alg` pinning, exp enforcement, constant-time compare (6 adversarial tests)
- **No default admin** — new users get `developer`; open-redirect guards on both ends of OAuth (`safeNext` + client re-validation of decoded state)
- OAuth CSRF state nonce in httpOnly cookie
- Setup URL **verified by minting an installation token** before persisting
- Generic 500 responses (no internals leaked); errors logged server-side
- `/api/auth/status` reports config booleans only, never secrets
- Migrations replace inline DDL; versioned + concurrency-safe
- CI now runs build/lint/typecheck/test

### ⚠️ Outstanding
1. **Leaked JSONBin key still in git HEAD** (`api/history.js`, `archive/v1/api/history.js`, `ersshaikacieacie`) — **rotation must be done externally** (JSONBin dashboard); deleting files does not un-leak history.
2. **Phase 0 is 100% uncommitted/unpushed** — `origin/main` still contains the legacy code, the leak, the misplaced CI, and has **never run a GitHub Actions workflow**.
3. `.env.example:42` comment is stale (still describes fail-open behavior).
4. Repo registration fabricates `githubId` randomly — fabricated data under a "no fabricated data ever" rule.
5. `docker-compose.yml` omits `GITHUB_APP_ID`/`GITHUB_APP_PRIVATE_KEY` (the primary credentials).
6. Tests still mock the DB (blueprint requires real-DB integration tests — Phase 1).

---

## Part 10 — Critical Findings (severity-ordered)

### 10.1 🔴 P0 — The shipped CLI binary is non-functional
`tsup` bundles `better-sqlite3`, `bindings`, `tree-sitter`, `tree-sitter-typescript` (they're `optionalDependencies`, not externalized) into `dist/index.js`. Native-module lookup then resolves against `dist/` where no `.node` file exists.
- **Verified:** `node dist/index.js analyze …` → `Could not locate the bindings file. Tried: …\commander@12.1.0\node_modules\commander\build\better_sqlite3.node` (13 wrong paths). Same command via `tsx src/index.ts` loads the binding fine.
- All DB commands (`index`, `analyze`, `serve`) fail; even if fixed, tree-sitter load also fails → **shipped CLI silently runs regex-only**.
- **Fix:** mark `better-sqlite3`, `bindings`, `tree-sitter*` as `external` in tsup config (or don't bundle this entry).

### 10.2 🔴 P0 — AST parser correctness bugs (empirically proven)
Against real `tree-sitter@0.21.1`:
- `export function foo(){}` / `export class Q{}` → **two rows each** (export_statement child re-visited by recursion) — and no UNIQUE constraint to stop it
- `export const bar = 1` → **no symbol at all** (name lives on `variable_declarator`, guard returns null) — *regex mode catches this; AST mode doesn't*
- `export { y } from './b'` → **no edge** (regex catches it)
- **Fix:** handle `lexical_declaration`/`variable_declarator`, skip re-visiting declaration children inside `export_statement`, add an `export … from` case, add `UNIQUE(file_path, symbol_name)` + unique edge key.

### 10.3 🔴 P0 — The dashboard is disconnected from the product's only real data
Webhook writes `analyses`; `/api/analysis` returns `[]` unconditionally. Plus 7 missing endpoints, nothing writing `repos`, and `/analysis/[id]`'s latent JSON-string-vs-object shape mismatch.
**Fix (Blueprint Phase 1):** implement the read APIs (`GET /api/analysis`, `/api/analysis/{id}`, `/api/repos*`) with snake_case→camelCase mapping (or align the UI), write `repos` on webhook/installation events.

### 10.4 🟠 P1 — Nothing is committed
~160 working-tree changes (Phase 0 + this audit's fixes) sit uncommitted; `main == origin/main` at `76cfb3d`. GitHub still serves the pre-Phase-0 repo (incl. leaked-key files and inert `infra/github` CI). CI file is untracked → Actions has never run.
**Fix:** review `git status` → stage → commit → push (needs your explicit go-ahead).

### 10.5 🟠 P1 — Four-way type/scoring duplication
`@cie/shared` is consumed by CLI only; web has `lib/types.ts` (full duplicate), `lib/blast-radius.ts` (3rd copy of types + scoring), webhook route (4th `ChangedSymbol`). Risk formula triplicated *inside the CLI itself* (`risk-scorer.ts`, `logger.ts`, test mock).
**Fix (Blueprint Phase 1):** extract `packages/engine` — seed from CLI `risk-scorer.ts`, delete web scoring, one model tested once.

### 10.6 🟡 P2 — Assorted inconsistencies
- Two conflicting `vercel.json` files (root vs `apps/web/`) — documented source of past deploy 404s
- Version skew: package.json `0.1.0` vs program `2.0.0` vs README "2.0" vs BLUEPRINT "3.0"
- `analyze -h` hijacked by `--head` (commander collision) → errors instead of help
- 3-dot file list vs 2-dot patches in `git.ts`; N+1 git processes; renames keep only new path
- `buildGraph` wipes `nodes/edges` with no transaction/root scoping; crash = truncated graph; sub-dir index wipes other dirs
- Zero-symbol/no-index runs still persist a confident `0/low` row
- `findImporters` code-search query `"{basename}" in:file` is broad (e.g. `"utils"`) → false-positive edges
- Dead code: `updateFileInGraph`, `clearResolverCache`, CLI `formatPRComment`, `dashboard/overview` API, `recharts` dep, `services/repos/users` CLI tables, `.cie.json` config
- UI: RepoCard fallback "Lerna" vs detail "Turbo"; sidebar active-state exact-match only; settings renders literal `**bold**`; landing footer `Docs`/`Twitter` → `href="#"`
- Shared package has no tests; `packages/config` has no tests

### 10.7 🟡 P2 — Test-coverage blind spots
Covered well: risk scorer math (31), BFS (8), webhook pipeline (14), middleware crypto (6).
**Not covered:** all 4 CLI commands, graph-builder parsers, symbol-resolver, diff-analyzer (zero tests), db/git/logger, OAuth routes, UI components, migrations, real-DB integration (mocked), dedup claim path (unreachable with mocked DB).
Note: the mocked-DB blind spot is exactly what let the boolean-bind crash survive (blueprint calls this out).

---

## Part 11 — Quality Gates (as of this audit)

| Gate | Command | Result |
|---|---|---|
| Build | `pnpm build` | ✅ 3 tasks (middleware compiles, all routes emitted) |
| Test | `pnpm test` | ✅ **65/65** (45 CLI + 20 web), run locally 2026-10-05 — **not yet CI-verified** (workflow never executed) |
| Lint | `pnpm lint` | ✅ 0 errors (43 `no-explicit-any`/style warnings) |
| Typecheck | `pnpm typecheck` | ✅ 4 packages |
| Lockfile | `pnpm install --frozen-lockfile` | ✅ CI-safe |
| CI file | `.github/workflows/ci.yml` | ⚠️ correct (build→lint→typecheck→test) but **untracked → never executed by GitHub** |

### Verification status — tracked separately (per external review 2026-10-05)

| State | Status |
|---|---|
| Local working tree | ✅ 162 changed files (Phase 0 + this session's fixes), gates green locally |
| Committed | ❌ HEAD `76cfb3d` == `origin/main` — **none** of the fixes below are in git yet |
| CI-verified | ❌ GitHub Actions has never run on this repo |
| Deployed | ⚠️ Vercel serves `origin/main` (pre-fix code) — behaves differently from the local tree |

Repo: `https://github.com/Sahil-Hub-Cloud/ACIE.git`, branch `main`.

---

## Part 12 — Roadmap Position & Recommended Next Steps

**Where we are:** End of **Phase 0 "Trust the base"** (working tree ~95% complete, 0% committed). **Phase 1 "One engine, real product"** not started.

| Priority | Action | Status |
|---|---|---|
| 1 | **Rotate the leaked JSONBin key** (external, manual — I cannot do this) | ❌ open — **you** |
| 2 | **Review `git status` in focused chunks, then commit + push** (never blind-push 162 files; check for secrets first) | ❌ open — needs your explicit go-ahead |
| 3 | **Fix CLI tsup externals** (§10.1) | ✅ done locally this session (verified `node dist/index.js index` exits 0) |
| 4 | **Fix AST parser bugs + UNIQUE constraints** (§10.2) | ✅ done locally this session (6 new tests, 45/45 CLI green) |
| 5 | **P0 security from external review:** tenant authorization on every repo/analysis/graph endpoint; bind installation setup to the *authenticated user's* authorized installation; remove global PAT fallback from customer-facing paths | ❌ open — implement with the read APIs |
| 6 | **P1 vertical slice:** installation → repo → PR → persisted analysis → detail page (read APIs + webhook writes `repos` + shape contract) | ❌ open — one usable pilot path beats a full dashboard |
| 7 | **P1 evidence quality:** exact base/head snapshot analysis, record truncation/fallback/unresolved-import coverage in every report; versioned analysis contract with runtime validation | ❌ open |
| 8 | Characterization tests → extract `packages/engine` (one scorer, one type set) | ❌ open |
| 9 | Advisory (non-blocking) GitHub Checks; durable analysis worker with out-of-order head guard | ❌ open — after the slice works |
| 10 | Hygiene: versions, dead code, `recharts`, single `vercel.json` | ❌ open |

### Positioning corrections adopted from external review (2026-10-05)
- **Identity:** ACIE — *evidence-first change impact for monorepos*; narrow to **TypeScript monorepos** first (file-extension filters are not multi-language support).
- **Wording:** "dependency evidence" / "potential impact", not "semantic proof"; deterministic parsing + graph traversal, not "AI engine"; the 0–100 score is an **uncalibrated heuristic**, never a failure probability — never gate merges on ≥75 today.
- **Claims withdrawn:** CodeRabbit "no gate/no learning"; unattributed 1-in-8 stat; "GitHub cannot ship this" moat framing; on-prem "supported product" (Docker files ≠ tested install/upgrade/recovery path).
- **Report content:** findings like "a removed export still has a resolved consumer at this commit — review this import", with commit-pinned evidence links and explicit coverage limits; never "Downstream will break."

**Honest headline:** ACIE today is an **alpha PR-analysis bot** (login → install → every PR gets a verified, deduplicated, persisted blast-radius comment) with a **dashboard that can't see its own results**, a CLI fixed locally but **uncommitted like everything else**, and positioning that oversells proof/prediction relative to what the code computes. The external reviewer's bar for v1: *three teams repeatedly use ACIE because it reveals something their review workflow misses — and pay to keep it.*
