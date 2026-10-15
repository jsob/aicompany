# NEXORA — AI Workforce Operating System

**Demo:** https://aicompany.abacusai.app

Most AI tools give you a chat.  
NEXORA gives you a team.

Manage digital AI employees with roles, tasks, artifacts, approvals, audit logs and cost control — in one interface.

## Why NEXORA

- **Digital employees** — AI agents with roles, instructions and budgets.
- **Task graph** — Kanban workflow from backlog to done.
- **Versioned artifacts** — traceable outputs with review status.
- **Human-in-the-loop** — approval gates before important actions.
- **Audit trail** — see who did what and when.
- **Cost control** — track tokens, spend and monthly budgets.
- **Open source** — inspect, self-host and extend.

# NEXORA — Digital Company Operating System

NEXORA is a platform for managing an AI-powered digital workforce.
Command center, digital employees, tasks (Kanban), artifacts,
approvals, integrations, audit log, and billing — all in a single interface.

🌐 **Live demo:** [aicompany.abacusai.app](https://aicompany.abacusai.app)
📖 **Русская версия:** [README.md](README.md)

---

## Features

- **Dashboard** — overview of company activity, tasks, and spending.
- **Digital employees** — create AI agents with configurable roles, instructions, and budgets.
- **Tasks (Kanban)** — task board with priorities, statuses, and assignees.
- **Artifacts** — versioned outputs produced by AI agents.
- **Approvals (Human-in-the-loop)** — review and sign-off workflow for results.
- **Audit** — full event log for transparency of actions.
- **Integrations** — catalog of connectable external services.
- **Billing** — internal accounting of operational costs by plan tier.
- **Settings** — company profile and member configuration.

## Tech stack

| Layer              | Technologies                                        |
|--------------------|-----------------------------------------------------|
| **Frontend**       | React 19, Tailwind CSS, Framer Motion, Recharts     |
| **Backend**        | Next.js 16 (App Router, API Routes), Prisma ORM     |
| **Database**       | PostgreSQL 16                                        |
| **Authentication** | Auth.js (NextAuth v5), JWT strategy                 |
| **AI**             | Abacus AI API (LLM for agent task execution)        |

## Project structure

```
app/
├── api/          # API routes (employees, tasks, artifacts, approvals, etc.)
├── app/          # Protected app pages (dashboard, employees, tasks...)
├── login/        # Sign-in page
└── signup/       # Sign-up page
components/
├── app/          # Client components for each module
├── brand/        # Logo and branding
├── layouts/      # Page wrappers (AppShell, PageHeader)
└── ui/           # Reusable UI components (30+)
lib/              # Utilities, types, role config, pricing, agent-runtime
prisma/           # Database schema (14 models)
scripts/          # Seeding and helper scripts
```

---

## Quick start (Docker Compose)

The bundled `docker-compose.yml` brings up **the app + database** with a single command.

1. Copy the environment file and fill it in:

   ```bash
   cp .env.example .env
   ```

2. Generate auth secrets and put them in `.env`
   (`NEXTAUTH_SECRET` and `AUTH_SECRET` may be identical):

   ```bash
   openssl rand -base64 32
   ```

3. *(Optional, required for real AI task execution)*
   Add your `ABACUSAI_API_KEY` to `.env`.
   Get a key: https://apps.abacus.ai/chatllm/admin/api-keys

4. Start it:

   ```bash
   docker compose up --build
   ```

   On first start the database schema is applied automatically
   (`prisma db push`) and demo data is seeded (`SEED_ON_START=true`).

5. Open the app: **http://localhost:3000**

### Demo access (after seeding)

| Field    | Value             |
|----------|-------------------|
| Login    | `demo@nexora.app` |
| Password | `demo1234`        |
| Company  | Northwind Labs    |

> After the first run you can set `SEED_ON_START=false` to avoid
> re-seeding demo data on every restart.
> Seeding is idempotent (via `upsert`) and never deletes data.

---

## Running with your own external database

If you already have PostgreSQL:

```bash
docker build -t nexora .

docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/dbname" \
  -e NEXTAUTH_SECRET="<generated secret>" \
  -e AUTH_SECRET="<same secret>" \
  -e ABACUSAI_API_KEY="<your key>" \
  -e SEED_ON_START=true \
  nexora
```

On startup the container applies the schema and seeds demo data.

---

## Environment variables

| Variable            | Required    | Purpose                                                    |
|---------------------|-------------|------------------------------------------------------------|
| `DATABASE_URL`      | yes         | PostgreSQL connection string                               |
| `NEXTAUTH_SECRET`   | yes         | Secret for signing sessions                                |
| `AUTH_SECRET`       | yes         | Same value as `NEXTAUTH_SECRET`                            |
| `ABACUSAI_API_KEY`  | for AI      | Key for real AI agent task execution                       |
| `AWS_REGION`        | optional    | S3 storage region (for file uploads)                       |
| `AWS_BUCKET_NAME`   | optional    | S3 bucket name                                             |
| `AWS_FOLDER_PREFIX` | optional    | Folder prefix inside the bucket                            |
| `SEED_ON_START`     | optional    | `true` — seed demo data on start                           |

> ⚠️ **Warning:** Never commit your `.env` file to the repository.

---

## What works, and what is a stub

| Module                                  | Status                                           |
|-----------------------------------------|--------------------------------------------------|
| Auth, multi-tenancy                     | ✅ Fully functional                               |
| Tasks, artifacts, approvals, audit      | ✅ Fully functional                               |
| AI task execution                       | ✅ Real (requires `ABACUSAI_API_KEY`)            |
| Billing                                 | ⚙️ Plan management without real charges          |
| Integrations                            | ⚙️ Catalog/registry without live OAuth           |

---

## Useful commands

```bash
# Stop
docker compose down

# Stop and remove database data
docker compose down -v

# App logs
docker compose logs -f app
```

---

## License

This project is distributed under the [Apache 2.0](LICENSE) license.
