# ⚡ ACIE — AI Change Impact Engine

> Google Maps for your codebase.

ACIE is a GitHub App that automatically analyzes every Pull Request and posts a blast radius report — telling developers exactly which files will be affected before they merge.

## 🔍 How it works

1. Developer opens a Pull Request
2. ACIE scans all changed files
3. Maps import/export relationships across the repo
4. Calculates blast radius
5. Posts a detailed risk report as a PR comment

## 🎯 Risk Levels

- ✅ **LOW** — No other files affected. Safe to merge.
- ⚠️ **MEDIUM** — 1-2 files affected, or missing test coverage.
- 🔴 **HIGH** — 3+ files affected. Review carefully.

## 🚀 Live

- **Landing Page:** https://acie-gamma.vercel.app
- **Dashboard:** https://acie-gamma.vercel.app/dashboard

## 🛠️ Built with

- GitHub Apps
- Vercel Serverless Functions
- Node.js
- JavaScript/TypeScript Parser

## 👤 Author

Built by [Sahil-Hub-Cloud](https://github.com/Sahil-Hub-Cloud)
