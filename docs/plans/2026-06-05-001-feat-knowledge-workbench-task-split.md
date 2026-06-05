# Knowledge Workbench Task Split

Origin plan: `docs/plans/2026-06-05-001-feat-knowledge-workbench-plan.md`

This split turns the plan into three parallel work packages:

1. Frontend development
2. Backend development
3. Operations and deployment

The split is designed for parallel Codex threads. Each task has a primary ownership area and should avoid editing files owned by another task unless integration requires it.

---

## Shared Coordination Rules

- Keep Markdown content source under `agent-pm-tech-knowledge/`.
- Keep generated content under `.generated/knowledge/`.
- Keep persistent learning data in SQLite outside generated artifacts.
- Do not add online Markdown editing or public multi-user behavior.
- Do not revert changes made by other threads.
- If a task needs a dependency or file owned by another task, record it in the final handoff instead of making unrelated edits.
- Every thread must list changed files, unimplemented assumptions, and verification results in its final response.

Expected shared generated artifacts:

| Artifact | Owner | Consumers |
|---|---|---|
| `.generated/knowledge/documents.json` | Backend | Frontend, Ops |
| `.generated/knowledge/sections.json` | Backend | Frontend, Backend search |
| `.generated/knowledge/self-tests.json` | Backend | Frontend, Backend study state |
| `.generated/knowledge/terms.json` | Backend | Frontend, Backend search |

Expected shared study statuses:

| Domain | Values |
|---|---|
| Self-test status | `mastered`, `uncertain`, `not_yet` |
| Study event types | `read`, `bookmark`, `note`, `self_test`, `search`, `refresh` |

---

## Task 1. Frontend Development

### Goal

Build the private learning workbench experience: login UI, app shell, dashboard, library, reader, search UI, terminology lookup, bookmarks, notes, self-test UI, weak-point review, and responsive visual polish.

### Primary Plan Coverage

- U1 frontend shell and design baseline
- U4 protected app shell and dashboard
- U5 reader UI and progress interaction
- U6 bookmarks and notes UI
- U7 search and terminology UI
- U8 self-test and review UI
- U10 visual QA and accessibility

### Owned Files

- `app/(auth)/login/page.tsx`
- `app/(workbench)/layout.tsx`
- `app/(workbench)/page.tsx`
- `app/(workbench)/library/page.tsx`
- `app/(workbench)/docs/[slug]/page.tsx`
- `app/(workbench)/search/page.tsx`
- `app/(workbench)/terms/page.tsx`
- `app/(workbench)/review/page.tsx`
- `app/(workbench)/bookmarks/page.tsx`
- `app/(workbench)/settings/page.tsx`
- `app/globals.css`
- `components/dashboard/`
- `components/layout/`
- `components/reader/`
- `components/search/`
- `components/self-test/`
- `components/ui/`
- `tests/e2e/dashboard.spec.ts`
- `tests/e2e/reader.spec.ts`
- `tests/e2e/search.spec.ts`
- `tests/e2e/self-test.spec.ts`
- `tests/e2e/bookmarks-notes.spec.ts`
- `tests/e2e/workbench-smoke.spec.ts`
- `tests/unit/reader.test.ts`
- `tests/unit/dashboard.test.ts`

### Avoid Editing

- `db/`
- `lib/auth/`
- `lib/db/`
- `scripts/build-content.mjs`
- `scripts/refresh-content.mjs`
- `Dockerfile`
- `docker-compose.yml`

### Required Deliverables

- A polished, responsive UI matching the 04 prototype direction: focused, readable, study-workbench feel.
- Login page UI connected to backend auth hooks or clearly typed placeholders.
- Dashboard showing continue reading, unfinished docs, weak modules, recent bookmarks/notes, and global search entry.
- Library page listing all documents in recommended order.
- Reader with table of contents, study rail, progress indicator, Mermaid fallback, bookmark controls, note controls, and self-test entry.
- Search page and terminology lookup using backend search contracts.
- Review page for uncertain and not-yet-mastered self-test items.
- Bookmarks page for saved passages and notes.
- Settings page showing content version, refresh status, account info, and backup guidance where available.

### Test Expectations

- Unauthenticated user is redirected to login.
- Logged-in smoke path covers dashboard, reader, search, bookmark, note, self-test, review, and settings.
- Mobile viewport has no overlapping text, broken controls, or unusable sidebar.
- Keyboard navigation reaches login, dashboard, reader, search, note, bookmark, and self-test controls.
- Mermaid failure still leaves readable source content.

### Dispatch Prompt

```text
You are responsible for frontend development for the personal Agent PM knowledge workbench.

Read:
- docs/plans/2026-06-05-001-feat-knowledge-workbench-plan.md
- docs/plans/2026-06-05-001-feat-knowledge-workbench-task-split.md
- agent-pm-tech-knowledge/scripts/build-04-html.mjs

Implement only the frontend-owned scope from Task 1. Do not edit backend, database, content compiler, Docker, or deployment files unless absolutely required; if you need something from those areas, record it in your final handoff. You are not alone in the codebase, so do not revert changes made by other threads.

Focus on the app shell, dashboard, library, reader, search UI, terminology lookup, bookmarks, notes, self-test UI, weak-point review, settings UI, responsive styling, accessibility, and frontend tests.

Final response must list changed files, assumptions about backend contracts, verification run, and anything blocked by backend or ops.
```

---

## Task 2. Backend Development

### Goal

Build the server-side product engine: project foundation, Markdown content compiler, generated content artifacts, authentication, SQLite/Drizzle persistence, study data mutations, private search, and typed contracts for the frontend.

### Primary Plan Coverage

- U1 project foundation and dependencies
- U2 Markdown content compiler
- U3 authentication and database
- U5 progress persistence
- U6 bookmark and note persistence
- U7 authenticated search backend
- U8 self-test and mastery persistence
- Backend side of U9 content version tracking

### Owned Files

- `package.json`
- `next.config.ts`
- `tsconfig.json`
- `drizzle.config.ts`
- `db/schema.ts`
- `db/migrations/`
- `lib/auth/`
- `lib/content/`
- `lib/db/`
- `lib/search/`
- `lib/study/`
- `app/api/`
- `app/actions/`
- `scripts/build-content.mjs`
- `scripts/seed-user.mjs`
- `agent-pm-tech-knowledge/workbench-overrides.json`
- `.generated/knowledge/`
- `tests/content/build-content.test.ts`
- `tests/db/auth-schema.test.ts`
- `tests/unit/search.test.ts`
- `tests/unit/self-test.test.ts`
- `tests/unit/bookmarks-notes.test.ts`
- `tests/unit/content-version.test.ts`

### Avoid Editing

- `components/`
- frontend route page UI files under `app/(workbench)/`
- `Dockerfile`
- `docker-compose.yml`
- deployment docs owned by Ops

### Required Deliverables

- Next.js app foundation with dependencies needed by backend and frontend.
- Content compiler that reads `agent-pm-tech-knowledge/INDEX.md`, processes 00-15 Markdown, and emits generated artifacts.
- AST-based extraction of headings, sections, Mermaid blocks, self-test items, mastery standards, and terminology entries.
- Source-controlled override support through `agent-pm-tech-knowledge/workbench-overrides.json`.
- Better Auth email/password setup for one primary user.
- SQLite + Drizzle schema and migrations for content versions, reading progress, bookmarks, notes, self-test states, and study events.
- Authenticated server actions or route handlers for progress, bookmarks, notes, self-test state, dashboard data, and search.
- Private weighted search over generated sections and terminology.

### Test Expectations

- Content compiler emits 16 documents in recommended order.
- Repeated content builds are deterministic when Markdown is unchanged.
- Self-test and terminology extraction works on existing documents.
- Override file changes generated artifacts without modifying source Markdown.
- Login succeeds for seeded user and rejects invalid credentials safely.
- Protected server actions reject unauthenticated requests.
- Study records are scoped to the logged-in user.
- Search returns relevant Tool Calling and terminology results for `tool schema` and Chinese terms such as `权限`.
- Content version records allow study data to survive refresh.

### Dispatch Prompt

```text
You are responsible for backend development for the personal Agent PM knowledge workbench.

Read:
- docs/plans/2026-06-05-001-feat-knowledge-workbench-plan.md
- docs/plans/2026-06-05-001-feat-knowledge-workbench-task-split.md
- agent-pm-tech-knowledge/INDEX.md
- agent-pm-tech-knowledge/READABILITY-STANDARD.md

Implement only the backend-owned scope from Task 2. You own project foundation, package dependencies, content compiler, auth, database, server actions/routes, search, and generated content artifacts. Do not edit frontend component/page UI or deployment files unless absolutely required; if you need something from those areas, record it in your final handoff. You are not alone in the codebase, so do not revert changes made by other threads.

Final response must list changed files, generated artifacts, database/schema decisions, frontend-facing contracts, verification run, and any integration assumptions.
```

---

## Task 3. Operations And Deployment

### Goal

Make the workbench self-hostable on the user's server with environment configuration, Docker deployment, reverse-proxy guidance, Git content refresh, persistent storage, backup/restore guidance, and operational checks.

### Primary Plan Coverage

- U9 content refresh and deployment operations
- U10 deployment documentation and operational QA
- Operational parts of R14, R15, R16

### Owned Files

- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- `.env.example`
- `.gitignore`
- `scripts/refresh-content.mjs`
- `scripts/backup-db.mjs`
- `scripts/restore-db.mjs`
- `docs/deployment.md`
- `docs/operations.md`
- `docs/plans/2026-06-05-001-feat-knowledge-workbench-plan.md` only if documenting a plan clarification is necessary

### Avoid Editing

- `components/`
- `app/(workbench)/` UI pages
- `db/schema.ts`
- backend route handlers and server actions
- `scripts/build-content.mjs`

### Required Deliverables

- Dockerfile suitable for a self-hosted Node/Next.js app.
- `docker-compose.yml` with persistent database and generated-content volumes.
- `.env.example` covering auth secrets, database path, app URL, primary user seed variables, refresh settings, and optional webhook secret.
- Content refresh script that can pull or use current Git content, rebuild generated artifacts, record refresh status, and fail safely.
- Backup and restore scripts or clear documented commands for the SQLite database.
- Deployment documentation for server setup, reverse proxy, environment variables, first user creation, content refresh, backup, restore, and troubleshooting.
- Operational notes for keeping generated content separate from persistent study data.

### Test Expectations

- Docker build succeeds once app dependencies exist.
- Compose configuration mounts persistent paths outside the image layer.
- Refresh script does not delete previous generated content when content compilation fails.
- Backup script creates a restorable SQLite backup path.
- Deployment docs include nginx or reverse-proxy guidance and database persistence warnings.
- `.env.example` contains no real secrets.

### Dispatch Prompt

```text
You are responsible for operations and deployment for the personal Agent PM knowledge workbench.

Read:
- docs/plans/2026-06-05-001-feat-knowledge-workbench-plan.md
- docs/plans/2026-06-05-001-feat-knowledge-workbench-task-split.md

Implement only the ops-owned scope from Task 3. You own Docker, compose, env examples, refresh/backup/restore scripts, deployment docs, and operational guidance. Do not edit frontend UI, database schema, backend route handlers, or the content compiler unless absolutely required; if you need something from those areas, record it in your final handoff. You are not alone in the codebase, so do not revert changes made by other threads.

Final response must list changed files, deployment assumptions, required env vars, verification run, and anything blocked by frontend or backend work.
```

---

## Integration Order After Three Threads Finish

1. Merge backend foundation first because it establishes dependencies, generated artifacts, auth, database, and server contracts.
2. Merge frontend next and adapt UI calls to the backend contracts.
3. Merge ops last and adjust deployment scripts to the final build commands and environment variables.
4. Run full verification after integration: build, content generation, migrations, auth smoke, logged-in workbench smoke, search, self-test, refresh, Docker or compose validation.

