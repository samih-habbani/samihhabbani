#!/usr/bin/env bash
# Replaces the LOCAL database with a fresh copy of the production one.
# Production is only READ (pg_dump); everything is written to the local DB.
# Needs PROD_DATABASE_URL (the online URL) and DATABASE_URL (local) in .env.local,
# and PostgreSQL 17 client tools (brew install postgresql@17).
set -euo pipefail
cd "$(dirname "$0")/.."

get() { grep -E "^$1=" .env.local | head -1 | cut -d= -f2- | tr -d '"'; }
get_commented() { grep -E "^# $1=" .env.local | head -1 | sed "s/^# $1=//" | tr -d '"'; }

PROD_URL="$(get PROD_DATABASE_URL)"; [ -n "$PROD_URL" ] || PROD_URL="$(get_commented PROD_DATABASE_URL)"
LOCAL_URL="$(get DATABASE_URL)"
[ -n "$PROD_URL" ] || { echo "PROD_DATABASE_URL not found in .env.local"; exit 1; }
case "$LOCAL_URL" in *localhost*|*127.0.0.1*) ;; *) echo "DATABASE_URL is not a local database — aborting."; exit 1;; esac

PG=/opt/homebrew/opt/postgresql@17/bin
DB="${LOCAL_URL##*/}"; DB="${DB%%\?*}"
echo "Local database: $DB"
$PG/dropdb --if-exists "$DB"
$PG/createdb "$DB"
$PG/pg_dump "$PROD_URL" --no-owner --no-privileges --no-acl --format=custom --file=/tmp/prod.dump
# the only expected error: Prisma Postgres' own "prisma_postgres" extension comment
$PG/pg_restore --no-owner --no-privileges --no-acl -d "$DB" /tmp/prod.dump 2>&1 | grep -v prisma_postgres || true
rm -f /tmp/prod.dump
echo "Done — local database refreshed from production."
