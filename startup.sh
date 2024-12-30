#!/bin/bash
set -euo pipefail

if [ -f .env ]; then
  while IFS='=' read -r key value; do
    if [[ -n "$key" ]]; then
      export "$key"="$value"
    fi
  done < .env
fi

if [ -z "$VITE_MONGODB_URI" ]; then
  echo "Error: VITE_MONGODB_URI environment variable is not set." >&2
  exit 1
fi

if [ -z "$VITE_PORT" ]; then
  VITE_PORT=3000
fi

if [ -z "$JWT_SECRET" ]; then
  echo "Error: JWT_SECRET environment variable is not set." >&2
  exit 1
fi

log_info() {
  date +"%Y-%m-%d %H:%M:%S" "$@"
}

log_error() {
  date +"%Y-%m-%d %H:%M:%S" "$@" >&2
}

cleanup() {
  if [ -f "backend_auth.pid" ]; then
    kill "$(cat "backend_auth.pid")"
    rm "backend_auth.pid"
  fi
  if [ -f "backend_goals.pid" ]; then
     kill "$(cat "backend_goals.pid")"
     rm "backend_goals.pid"
  fi
}

trap cleanup EXIT ERR INT TERM

log_info "Starting backend services"
concurrently "node api/auth.ts" "node api/goals.ts" > backend.log 2>&1 &
BACKEND_AUTH_PID=$!
echo "$BACKEND_AUTH_PID" > backend_auth.pid
sleep 1
concurrently "node api/goals.ts" > backend.log 2>&1 &
BACKEND_GOALS_PID=$!
echo "$BACKEND_GOALS_PID" > backend_goals.pid

log_info "Backend services started with PID $BACKEND_AUTH_PID $BACKEND_GOALS_PID"