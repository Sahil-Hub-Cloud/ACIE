# ACIE — AI Change Impact Engine

> **Google Maps for your codebase.** ACIE automatically analyzes every Pull Request and posts a blast-radius report telling developers exactly which files, services, and tests are affected **before** they merge.

## Quick Start (60 seconds)

```bash
# 1. Clone and install
git clone https://github.com/Sahil-Hub-Cloud/ACIE.git
cd ACIE
pnpm install

# 2. Configure environment (see .env.example)
cp .env.example .env.local
# Fill in: GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET,
#          GITHUB_WEBHOOK_SECRET, JWT_SECRET, TURSO_DATABASE_URL, TURSO_AUTH_TOKEN

# 3. Start development
pnpm dev
# → Web dashboard at http://localhost:3000
# → CLI available via `pnpm cli`

# 4. Install the GitHub App on a test repo
# Settings → Developer settings → GitHub Apps → [Your App] → Install App
# Select repositories → Save

# 5. Open a PR → watch the blast-radius comment appear
```

## Architecture

```mermaid
graph TB
  subgraph "GitHub"
    PR[Pull Request] --> Webhook[Webhook Event]
  end
  
  Webhook -->|HMAC Verify| Analyze[/api/webhooks/analyze]
  
  Analyze --> Diff[Diff Analysis]
  Diff -->|Extract Changed Exports| Importers[Find Importers]
  Importers -->|GitHub Code Search| Graph[Dependency Graph]
  Graph --> BFS[BFS Blast Radius]
  BFS --> Scorer[Risk Scorer 0-100]
  
  Scorer -->|Generate| Comment[PR Comment]
  Scorer -->|Generate| CheckRun[GitHub Check Run]
  Scorer -->|Select| Tests[Test Selection]
  Scorer -->|Suggest| Reviewers[Reviewer Suggestions]
  
  CheckRun --> GitHub[(GitHub)]
  Comment --> GitHub
  
  Analyze --> DB[(Turso/libSQL)]
  DB --> Dashboard[Next.js Dashboard]
  
  CLI[CLI: acie index/analyze/serve] --> LocalDB[(SQLite)]
  LocalDB -.->|Same Engine| Graph
```

### Monorepo Structure

```
acie/
├── apps/
│   ├── cli/          # Core CLI — index repos, analyze blast radius locally
│   └── web/          # Next.js 14 dashboard + ALL API route handlers
├── packages/
│   ├── engine/       # Single source of truth: scoring, BFS, entry-points, services
│   ├── shared/       # Shared TypeScript types (@acie/shared)
│   └── config/       # ESLint + TypeScript configs
├── infra/docker/     # Dockerfile + docker-compose (web only)
└── .github/workflows/ci.yml
```

## What It Does

| Feature | Description |
|---------|-------------|
| **Blast Radius** | BFS on dependency graph from changed files → all downstream dependents |
| **Proof Paths** | Each impacted file shows exact chain: `a.ts → b.ts → c.ts (via symbol)` |
| **Risk Score** | 0-100 heuristic (entry points + services + depth + files + symbols) |
| **Test Selection** | Heuristic "likely affected tests" with confidence (high/medium/low) |
| **Reviewer Suggestions** | From CODEOWNERS (falls back to git-blame) |
| **GitHub Check Run** | Neutral/failure alongside PR comment with full markdown output |
| **Performance Budget** | 60s webhook budget with per-PR duration tracking |
| **Tenant Isolation** | Every read/write scoped to installations the user claimed |

## Risk Levels

| Level | Score | Meaning |
|-------|-------|---------|
| LOW | 0-25 | Little structural reach |
| MEDIUM | 26-50 | Limited downstream fan-out |
| HIGH | 51-75 | Broad downstream fan-out |
| CRITICAL | 76-100 | Entry points in blast radius |

> **Scores are an uncalibrated structural heuristic** — potential impact, not failure probability. Never gate merges on ≥75 today.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Monorepo** | pnpm 10 workspaces + Turborepo 2 |
| **Web** | Next.js 14 (App Router), React 18, Tailwind CSS |
| **Dashboard** | React Flow (graph viz), Zustand (state) |
| **Database** | Turso/libSQL (web), better-sqlite3 (CLI) |
| **Auth** | GitHub OAuth → HS256 JWT in httpOnly cookie, Edge middleware |
| **GitHub** | GitHub App (RS256 JWT, installation tokens) + PAT fallback |
| **CLI Parsing** | tree-sitter + tree-sitter-typescript (AST) with regex fallback |
| **Testing** | vitest (149 tests) |
| **CI** | GitHub Actions (build → lint → typecheck → test) |

## Honest Limitations

| Area | Status |
|------|--------|
| **Language support** | TypeScript/JavaScript only (Python/Go parse but no symbol extraction) |
| **Symbol-level edges** | Import/export only — no `calls`, `extends`, `implements` yet |
| **Incremental indexing** | Not implemented — full re-index on each `acie index` |
| **Cross-repo impact** | Not supported — single-repo analysis only |
| **Server-side indexing** | CLI-only — web dashboard shows empty graph with `source: 'cli'` |
| **Score calibration** | Uncalibrated heuristic — do not gate merges on score alone |
| **Test selection** | Heuristic only — no dynamic analysis or coverage data |
| **Reviewer fallback** | CODEOWNERS only — git-blame fallback not yet implemented |

## CLI Usage

```bash
# Build the binary
pnpm cli build

# Initialize in a repo
acie init

# Index the dependency graph (run after each significant change)
acie index [path]

# Analyze a PR or local changes
acie analyze -b main -h HEAD --repo-url https://github.com/owner/repo

# Start local API server to query graph
acie serve -p 3002
```

## Dashboard Pages

| Route | Description |
|-------|-------------|
| `/repos` | List repos from GitHub App installations (auto-registered) |
| `/repos/:id` | Repo detail with KPI tiles + dependency graph (CLI-sourced) |
| `/analysis` | Audit log of all PR analyses (tenant-scoped) |
| `/analysis/:id` | Full blast-radius detail with proof paths + test selection + reviewers |
| `/graph` | Global dependency graph explorer |
| `/settings` | Auth/session/OAuth/webhook/DB status |

## Environment Variables

See `.env.example` for all variables. **Required:**

```bash
# GitHub App
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_WEBHOOK_SECRET=

# Auth
JWT_SECRET=

# Database (Turso)
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
```

## Testing

```bash
# All tests
pnpm test

# Specific package
pnpm --filter @acie/engine test
pnpm --filter @acie/cli test
pnpm --filter @acie/web test
```

## CI/CD

```yaml
# .github/workflows/ci.yml runs on push/PR to main
jobs:
  verify:
    steps:
      - checkout
      - setup-node (v22) + pnpm 10
      - install (frozen-lockfile)
      - build
      - lint
      - typecheck
      - test
```

## License

MIT — Built by [Sahil-Hub-Cloud](https://github.com/Sahil-Hub-Cloud)