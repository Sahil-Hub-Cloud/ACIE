# ACIE 2.0 — AI Change Impact Engine

> Google Maps for your codebase.

ACIE automatically analyzes every Pull Request and posts a blast radius report — telling developers exactly which files, services, and systems are affected **before** they merge.

## 🏗️ Architecture

```
acie/
├── apps/
│   ├── cli/    # Core CLI — parses repos, builds dependency graphs
│   ├── api/    # NestJS REST API — GitHub App + webhooks + analysis
│   └── web/    # Next.js 14 dashboard — React Flow + Recharts
├── packages/
│   ├── shared/ # Shared TypeScript types
│   └── config/ # ESLint + TypeScript configs
└── archive/v1/ # Original Vercel serverless app (preserved)
```

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start all apps in development mode
pnpm dev

# Or start individually:
pnpm cli dev        # CLI
pnpm api dev        # NestJS API  (http://localhost:3001)
pnpm web dev        # Next.js Web (http://localhost:3000)
```

## 🔍 How It Works

1. Developer opens a Pull Request
2. GitHub sends a webhook to ACIE API
3. API triggers the CLI graph analyzer
4. CLI parses the repo AST, finds changed symbols
5. Blast radius calculator does BFS on the dependency graph
6. Risk scorer assigns a score (0–100) and level (low/medium/high/critical)
7. ACIE posts a detailed comment on the PR
8. Results appear in the dashboard

## 🎯 Risk Levels

| Level | Score | Meaning |
|-------|-------|---------|
| ✅ LOW | 0–25 | No downstream impact |
| ⚠️ MEDIUM | 26–50 | 1-2 services affected |
| 🔴 HIGH | 51–75 | 3+ services affected |
| 🚨 CRITICAL | 76–100 | Entry points affected |

## 🛠️ Tech Stack

- **CLI**: Node.js, TypeScript, tree-sitter, better-sqlite3, Commander
- **API**: NestJS 10, TypeScript, Octokit, better-sqlite3, JWT
- **Web**: Next.js 14, React Flow, Recharts, shadcn/ui, Tailwind CSS
- **Infra**: Turborepo, pnpm workspaces, Docker, Vercel, Render

## 📖 Documentation

- [Architecture](docs/architecture.md)
- [API Reference](docs/api-reference.md)
- [Deployment](docs/deployment.md)
- [Contributing](docs/contributing.md)

## 👤 Author

Built by [Sahil-Hub-Cloud](https://github.com/Sahil-Hub-Cloud)
