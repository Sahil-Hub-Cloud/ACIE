# ACIE - AI Change Impact Engine

ACIE - AI Change Impact Engine. Analyzes code dependencies and posts blast radius reports on GitHub Pull Requests.

## Project Structure

```
acie/
  src/
    github/        ← GitHub App logic
    parser/        ← code parsing logic
    graph/         ← Neo4j database logic
    comment/       ← PR comment logic
  index.js         ← main entry point
  package.json
  .env.example     ← environment variables template
  README.md
```

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

## Environment Variables

| Variable         | Description                        |
|------------------|------------------------------------|
| `APP_ID`         | GitHub App ID                      |
| `PRIVATE_KEY`    | GitHub App private key             |
| `WEBHOOK_SECRET` | GitHub webhook secret              |
| `NEO4J_URI`      | Neo4j database connection URI      |
| `NEO4J_USER`     | Neo4j database username            |
| `NEO4J_PASSWORD` | Neo4j database password            |

## Running the App

```bash
npm start
```

## Dependencies

- **[probot](https://probot.github.io/)** — GitHub App framework
- **[dotenv](https://github.com/motdotla/dotenv)** — Loads environment variables from `.env`
- **[axios](https://axios-http.com/)** — HTTP client for API requests
