# Knowledge Workbench Deployment

This guide describes the intended self-hosted deployment for the private Agent PM knowledge workbench. It assumes a single Node/Next.js service running behind a reverse proxy, with SQLite study data and generated content stored outside the image layer.

No real passwords, tokens, SSH keys, or auth secrets should be committed to this repository. Put secrets only in the server-side `.env` file or the host secret manager.

## Deployment Model

```text
Internet
  -> nginx or another reverse proxy
  -> 127.0.0.1:3000
  -> Docker container: Next.js standalone server
  -> persistent volume: /app/data/workbench.sqlite
  -> persistent volume: /app/.generated/knowledge
```

Persistent paths:

| Path | Purpose | Persistence requirement |
|---|---|---|
| `/app/data/workbench.sqlite` | SQLite auth and study data | Must be persisted and backed up |
| `/app/data/refresh-status.json` | Last content refresh status | Should be persisted |
| `/app/.generated/knowledge` | Generated Markdown-derived content artifacts | Persisted so refresh can update it safely |
| `/app/backups` | SQLite backup output | Bind-mounted to a host directory |

Generated content can be rebuilt from Git content. The SQLite database contains user state and is the critical backup target.

## Integration Assumptions

The backend work is expected to provide:

- `package.json`
- `next.config.*` configured for Next.js standalone output, for example `output: "standalone"`
- package scripts:
  - `build`
  - `start`
  - `db:migrate`
  - `content:build`
  - optionally `seed:user`
- `scripts/build-content.mjs` or a `content:build` script that respects `GENERATED_CONTENT_DIR`
- SQLite database code that reads `DATABASE_PATH`
- auth code that reads `BETTER_AUTH_SECRET` or `AUTH_SECRET` and the public app URL

If any assumed script is missing, the Docker build or operational scripts should fail clearly during integration.

## Environment File

Create `.env` on the server from `.env.example`:

```bash
cp .env.example .env
```

Set real values on the server only. Do not commit `.env`.

Minimum required variables:

| Variable | Required | Notes |
|---|---:|---|
| `APP_URL` | yes | Public HTTPS URL |
| `NEXT_PUBLIC_APP_URL` | yes | Same public HTTPS URL unless frontend contract changes |
| `BETTER_AUTH_URL` | yes | Public HTTPS URL used by Better Auth |
| `AUTH_SECRET` | yes | Random secret generated on the server |
| `BETTER_AUTH_SECRET` | yes | Random secret generated on the server |
| `DATABASE_PATH` | yes | Defaults to `/app/data/workbench.sqlite` in Docker |
| `GENERATED_CONTENT_DIR` | yes | Defaults to `/app/.generated/knowledge` in Docker |
| `CONTENT_REPO_DIR` | yes | Defaults to `/app` in Docker |
| `REFRESH_GIT_REMOTE` | recommended | Usually `origin` |
| `REFRESH_GIT_BRANCH` | recommended | Usually `main` |
| `REFRESH_ALLOW_GIT_PULL` | recommended | `true` for server-side pull refresh, `false` for manual refresh |
| `BACKUP_DIR` | recommended | Defaults to `/app/backups` |
| `PRIMARY_USER_EMAIL` | initial seed only | Remove or leave unused after first user is seeded |
| `PRIMARY_USER_PASSWORD` | initial seed only | Never commit or print |
| `PRIMARY_USER_NAME` | initial seed only | Display name for the first user |
| `REFRESH_WEBHOOK_SECRET` | optional | Only needed if backend exposes a refresh webhook |

Generate secrets on the server with a local command such as:

```bash
openssl rand -base64 32
```

## Docker Compose

Build and start after backend integration:

```bash
docker compose up -d --build
```

The compose file binds the app to `127.0.0.1:${HOST_PORT:-3000}` so the service is not directly exposed without the reverse proxy.

Run migrations after the backend provides `db:migrate`:

```bash
docker compose exec workbench npm run db:migrate
```

Seed the primary user after the backend provides a seed script:

```bash
docker compose exec workbench npm run seed:user
```

If the final backend uses `pnpm` or another package manager inside the image, adapt the command during integration.

## Reverse Proxy

Example nginx server block:

```nginx
server {
    listen 80;
    server_name your-domain.example;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Use HTTPS in production, for example with certbot or your existing certificate automation. The app URL and auth URL must match the public HTTPS origin.

## Content Refresh

Manual refresh inside the container:

```bash
docker compose exec workbench node scripts/refresh-content.mjs --pull
```

Manual refresh without Git pull:

```bash
docker compose exec workbench node scripts/refresh-content.mjs --no-pull
```

Refresh behavior:

- Pulls from `REFRESH_GIT_REMOTE` and `REFRESH_GIT_BRANCH` only when enabled.
- Runs the assumed `content:build` package script.
- Builds into a temporary directory first.
- Replaces `.generated/knowledge` only after successful generation.
- Preserves the previous generated content if generation fails.
- Writes status to `REFRESH_STATUS_PATH`.
- Does not SSH or deploy to another machine.

If webhook refresh is added by the backend, the webhook route should verify `REFRESH_WEBHOOK_SECRET` and then invoke the same script or equivalent server-side job.

## Backup And Restore

Create a SQLite backup:

```bash
docker compose exec workbench node scripts/backup-db.mjs
```

Backups are written to `/app/backups`, bind-mounted to `./backups` on the host by default. Copy backup files off-server according to your normal backup policy.

Restore requires the app to be stopped and `--force` to be passed:

```bash
docker compose stop workbench
docker compose run --rm workbench node scripts/restore-db.mjs /app/backups/workbench-YYYY-MM-DD.sqlite --force
docker compose up -d
```

The restore script checks SQLite integrity before replacing the active database and saves the previous database with a `.pre-restore-*` suffix when one exists.

## Deployment Checklist

- Backend foundation merged with `package.json`, standalone Next output, migrations, and content build scripts.
- `.env` created on the server with real secrets and not committed.
- `docker compose config` passes.
- `docker compose up -d --build` succeeds.
- Migrations run successfully on an empty persistent database.
- Primary user is seeded once.
- Login works through the HTTPS reverse proxy.
- `.generated/knowledge` contains generated content artifacts.
- `scripts/refresh-content.mjs --no-pull` succeeds.
- `scripts/backup-db.mjs` creates a backup and manifest.
- Restore has been tested on a disposable database before relying on it in production.
