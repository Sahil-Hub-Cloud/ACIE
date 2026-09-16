# ACIE 2.0 - AI Change Impact Engine

> Google Maps for your codebase.

ACIE automatically analyzes every Pull Request and posts a blast radius report - telling developers exactly which files, services, and systems are affected **before** they merge.

## Architecture

```
acie/
|-- apps/
|   |-- cli/        # Core CLI - parses repos, builds dependency graphs
|   `-- web/        # Next.js 14 dashboard + API route handlers
|-- packages/
|   |-- shared/     # Shared TypeScript types
|   `-- config/     # ESLint + TypeScript configs
`-- infra/
    |-- docker/     # Dockerfile + docker-compose
    `-- github/     # CI workflows
```

> Note: the API layer lives in `apps/web/src/app/api/*` as Next.js route handlers
> (`/api/webhooks/analyze`, `/api/auth/*`, `/api/repos`, `/api/dashboard/*`). There is
> no separate NestJS service.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start all apps in development mode
pnpm dev

# Or start individually:
pnpm cli dev        # CLI
pnpm web dev        # Next.js Web (http://localhost:3000)
```

## How It Works

1. Developer opens a Pull Request
2. GitHub sends a webhook to the ACIE API route (`/api/webhooks/analyze`)
3. The handler parses the diff, extracts changed exports, and finds downstream importers
4. The blast radius calculator does BFS on the dependency graph
5. The risk scorer assigns a score (0-100) and level (low/medium/high/critical)
6. ACIE posts a detailed comment on the PR
7. Results appear in the dashboard

## Risk Levels

| Level | Score | Meaning |
|-------|-------|---------|
| LOW | 0-25 | No downstream impact |
| MEDIUM | 26-50 | 1-2 services affected |
| HIGH | 51-75 | 3+ services affected |
| CRITICAL | 76-100 | Entry points affected |

## Tech Stack

- **CLI**: Node.js, TypeScript, tree-sitter, better-sqlite3, Commander
- **Web**: Next.js 14, React Flow, Recharts, Tailwind CSS, Turso (libSQL)
- **Infra**: Turborepo, pnpm workspaces, Docker, Vercel

## Author

Built by [Sahil-Hub-Cloud](https://github.com/Sahil-Hub-Cloud)