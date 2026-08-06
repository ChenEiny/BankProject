#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

case "$1" in
  start)
    docker compose --env-file server/.env up -d --build
    ;;
  stop)
    docker compose down
    ;;
  restart)
    docker compose down
    docker compose --env-file server/.env up -d --build
    ;;
  logs)
    docker compose logs -f backend
    ;;
  ps)
    docker compose ps
    ;;
  *)
    echo "Usage: ./docker.sh {start|stop|restart|logs|ps}"
    exit 1
    ;;
esac
