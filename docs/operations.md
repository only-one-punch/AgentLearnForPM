# Knowledge Workbench Operations

This document covers routine operations for the private Agent PM knowledge workbench after deployment.

## Operating Principles

- Keep Markdown source in Git under `agent-pm-tech-knowledge/`.
- Keep generated content in `.generated/knowledge`.
- Keep persistent study data in SQLite at `DATABASE_PATH`.
- Treat SQLite backups as critical user data.
- Treat generated content as rebuildable, but persist it so failed refreshes do not remove the working version.
- Never write real secrets to repository files, logs, docs, or support messages.

## Service Layout

Docker paths:

| Path | Owner | Operational note |
|---|---|---|
| `/app` | image | Application code and scripts |
| `/app/data` | Docker volume | SQLite database and refresh status |
| `/app/.generated/knowledge` | Docker volume | Generated content artifacts |
| `/app/backups` | host bind mount | SQLite backup files and manifests |

The compose service listens on `127.0.0.1:${HOST_PORT:-3000}`. Public access should go through nginx, Caddy, or another reverse proxy with HTTPS.

## Common Commands

Start or restart:

```bash
docker compose up -d
docker compose restart workbench
```

View logs:

```bash
docker compose logs -f --tail=200 workbench
```

Check health:

```bash
docker compose ps
docker compose exec workbench wget -qO- http://127.0.0.1:3000/login
```

Run migrations after an app update:

```bash
docker compose exec workbench npm run db:migrate
```

The package manager command may change during backend integration if the final image uses `pnpm` or another runner.

## Content Refresh Runbook

Manual refresh with Git pull:

```bash
docker compose exec workbench node scripts/refresh-content.mjs --pull
```

Manual refresh from current checked-out content:

```bash
docker compose exec workbench node scripts/refresh-content.mjs --no-pull
```

Check refresh status:

```bash
docker compose exec workbench cat /app/data/refresh-status.json
```

Refresh success writes:

- `state: "success"`
- `startedAt`
- `finishedAt`
- `gitCommit`
- `contentVersion`
- `contentHash`
- `generatedDir`
- `pulled`

Refresh failure writes:

- `state: "failed"`
- timestamps
- `gitCommit` if available
- `error`
- `restoredPreviousGeneratedContent`

If refresh fails, the previous `.generated/knowledge` directory should remain available. Investigate the content build error, fix the content or compiler, then rerun refresh.

## Backup Runbook

Create a database backup:

```bash
docker compose exec workbench node scripts/backup-db.mjs
```

The script prints the created backup path and writes a JSON manifest containing:

- creation time
- source database path
- backup path
- byte size
- SHA-256 checksum

Recommended policy for a personal deployment:

- Run a backup before every app update or content compiler change.
- Keep at least 7 daily backups and 4 weekly backups.
- Copy backups off the server if the study data matters.
- Periodically test restore on a disposable copy.

## Restore Runbook

Restores overwrite `DATABASE_PATH` and therefore require explicit `--force`.

```bash
docker compose stop workbench
docker compose run --rm workbench node scripts/restore-db.mjs /app/backups/workbench-YYYY-MM-DD.sqlite --force
docker compose up -d
```

The restore script:

- Refuses to run without `--force`.
- Checks `PRAGMA integrity_check` on the backup.
- Saves the current database with a `.pre-restore-*` suffix if it exists.
- Replaces the active SQLite file only after the backup passes integrity check.

After restore:

```bash
docker compose logs --tail=100 workbench
```

Then log in and verify dashboard progress, bookmarks, notes, and self-test state.

## Update Runbook

After new code is merged by the main coordination thread:

```bash
git pull --ff-only origin main
docker compose build workbench
docker compose run --rm workbench node scripts/backup-db.mjs
docker compose up -d
docker compose exec workbench npm run db:migrate
docker compose exec workbench node scripts/refresh-content.mjs --no-pull
```

Adjust package manager commands after backend integration if needed.

## Troubleshooting

### App Does Not Start

- Check `docker compose logs workbench`.
- Confirm `.env` exists on the server.
- Confirm auth secrets are set and not placeholder values.
- Confirm `DATABASE_PATH` points inside the persisted data volume.
- Confirm backend build scripts have been integrated.

### Login Redirects To The Wrong URL

- Check `APP_URL`, `NEXT_PUBLIC_APP_URL`, and `BETTER_AUTH_URL`.
- Confirm the reverse proxy sends `X-Forwarded-Proto`.
- Confirm the public URL uses HTTPS in production.

### Refresh Fails

- Read `/app/data/refresh-status.json`.
- Confirm `package.json` has `content:build`.
- Confirm the content builder respects `GENERATED_CONTENT_DIR`.
- Run with `--no-pull` to separate Git problems from compiler problems.
- Keep the current generated content in place until a successful refresh is available.

### Generated Content Is Missing

- Confirm the `workbench-generated` volume is mounted.
- Run refresh manually.
- Check that `.generated/knowledge` contains JSON artifacts expected by the backend/frontend.

### Database Errors

- Confirm the SQLite file exists at `DATABASE_PATH`.
- Confirm the container user can read/write `/app/data`.
- Run migrations.
- Restore from the latest known-good backup if corruption is confirmed.

## Security Notes

- Do not expose the container port directly to the public network.
- Use HTTPS at the reverse proxy.
- Keep `.env` readable only by the deploy user.
- Rotate auth secrets if they are ever printed or committed.
- Do not store SSH passwords, Git deploy keys, or webhook secrets in repository files.
- Keep server access and true deployment steps coordinated by the main thread.
