#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/apps/api/docker-compose.integration.yml"
DATABASE_URL="postgresql://scrambleiq:scrambleiq@127.0.0.1:55432/scrambleiq_test"
DOCKER_COMPOSE_CMD=(docker compose)

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: docker is required to run integration tests." >&2
  echo "Install Docker (with Compose) and retry." >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Error: docker compose is required to run integration tests." >&2
  echo "Enable the Docker Compose plugin and retry." >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "Error: psql is required to run integration tests." >&2
  echo "Install the PostgreSQL client and retry." >&2
  exit 1
fi

cleanup() {
  "${DOCKER_COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" down -v >/dev/null 2>&1 || true
}

trap cleanup EXIT

"${DOCKER_COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" up -d --wait

export DATABASE_URL
npm run test:integration --workspace @scrambleiq/api
