# AdmitOS Prototype

A working prototype demonstrating the core architecture for the AdmitOS admissions workflow platform.

## What this demonstrates

1. **Case Management Dashboard** — Advisor view with filterable case list, stats, and search
2. **Workflow State Machine** — Table-driven state transitions for US undergraduate admissions (13 states, with validation rules and required artifact gates)
3. **AI Artifact Generation** — Simulated LLM endpoints that produce school lists, personal statement drafts, and activity summaries based on student profile data
4. **Approval System** — Three-action review flow (approve / request revision / reject) with audit logging
5. **Multi-Role Access** — Switch between Admin, Senior Advisor, Advisor, and Student to see role-appropriate views
6. **Audit Trail** — Every action (state transitions, artifact creation, approvals) logged with timestamp and actor

## Running locally

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Architecture

- **Frontend**: Next.js 14 (App Router) with client components
- **API**: Next.js API routes (would be separate Express service in production)
- **Database**: sql.js (WASM-based SQLite) — in-memory for easy demo, PostgreSQL in production
- **Workflow Engine**: Custom table-driven state machine reading definitions from the database
- **AI Service**: Abstraction layer over LLM providers — currently returns simulated but realistic outputs with configurable latency

## Demo roles

Use the dropdown in the sidebar to switch:

| Role | User | What they see |
|------|------|---------------|
| Admin | Sarah Chen | All cases, all controls |
| Advisor | James Wright | Their assigned cases, can generate AI artifacts and approve |
| Senior Advisor | Maria Garcia | Team-wide view |
| Student | Alex Kumar | Own case only, read-only progress |

## Key design decisions

- **DB-stored workflow definitions**: Admissions processes change yearly and differ by country. Hardcoding states would mean code changes for every workflow update. Storing them in the DB means an admin editor can modify workflows without deploying.
- **Async AI generation**: LLM calls take 5-30s. The prototype simulates this with realistic delays. In production, this would use a job queue (BullMQ/Redis) with polling or WebSocket notifications.
- **Monolith-first**: For a beta with a small team, a well-structured monolith ships faster and is easier to debug than microservices. Extract services later when bottlenecks are known.
- **Artifact versioning**: Every AI generation creates a new artifact version. Old versions are preserved for audit trail.

## Production considerations not in prototype

- NextAuth with Google OAuth / magic links
- PostgreSQL with Prisma ORM
- Redis + BullMQ for async job processing
- S3/R2 for document uploads
- Real LLM API integration (OpenAI, Claude) with token budgeting
- Email notifications (SendGrid/Resend)
- Rate limiting and error handling for LLM endpoints
