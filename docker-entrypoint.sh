#!/usr/bin/env bash
set -e

# Wait briefly for the database, then sync the schema so a fresh database gets
# all tables. `db push` is idempotent and safe to run on every container start.
if [ -n "$DATABASE_URL" ]; then
  echo "[entrypoint] Syncing database schema (prisma db push)..."
  yarn prisma db push --skip-generate || echo "[entrypoint] WARN: db push failed (continuing)."

  if [ "${SEED_ON_START:-false}" = "true" ]; then
    echo "[entrypoint] Seeding demo data..."
    yarn prisma db seed || echo "[entrypoint] WARN: seed failed (continuing)."
  fi
else
  echo "[entrypoint] WARN: DATABASE_URL is not set; skipping schema sync."
fi

echo "[entrypoint] Starting application..."
exec "$@"
