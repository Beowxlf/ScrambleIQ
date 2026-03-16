#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/apps/api/docker-compose.integration.yml"
DATABASE_URL="postgresql://scrambleiq:scrambleiq@127.0.0.1:55432/scrambleiq_test"

cleanup() {
  docker compose -f "$COMPOSE_FILE" down -v >/dev/null 2>&1 || true
}

trap cleanup EXIT

docker compose -f "$COMPOSE_FILE" up -d --wait

export DATABASE_URL
npm run test:integration --workspace @scrambleiq/api
