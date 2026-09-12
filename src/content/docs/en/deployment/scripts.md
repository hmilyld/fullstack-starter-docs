---
title: Development and Build Scripts
description: Behavior, subcommands, and dependency assumptions of dev.sh and build.sh.
---

The generated project root contains two scripts: `dev.sh` for development and `build.sh` for building and checks.

## dev.sh

```bash
./dev.sh start      # Default; install dependencies and start frontend and backend
./dev.sh stop       # Stop services
./dev.sh restart    # Restart
./dev.sh install    # Install dependencies only
```

`start` will:

1. Run `install`: frontend `npm install`; Python backend `uv sync`; Java backend dependencies managed automatically by Maven.
2. Start the backend:
   - Python: `uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8088`
   - Java: `mvn spring-boot:run`
3. Start the frontend: `npm run dev` (port 5173).
4. Print the access addresses and wait (`wait`).

The script uses `trap cleanup EXIT INT TERM` to terminate both the backend and frontend processes on exit.

### Automatically Generating the JWT Key

When you choose the Python backend and neither the `JWT_SECRET_KEY` environment variable nor `backend/.env` is set, `dev.sh` will:

```bash
export JWT_SECRET_KEY="$(openssl rand -base64 48)"
```

and warn that "JWT_SECRET_KEY is not set; a random key was generated automatically for local development (logins will be invalid after a restart)" (未设置 JWT_SECRET_KEY，已为本地开发自动生成随机密钥（重启后登录会失效）).

:::caution[openssl required]
Automatic key generation depends on `openssl`. If the command is not available on your machine, set `JWT_SECRET_KEY` manually, or the backend will refuse to start due to its security validation.
:::

## build.sh

```bash
./build.sh
```

Runs in order:

1. Frontend build: `cd frontend && npm run build`
2. Backend check:
   - Python: `uv run ruff check .`
   - Java: `mvn spotless:check`

If any step fails, the script exits immediately due to `set -e`.

## Related Pages

- [Installation and Environment](/en/getting-started/installation/)
- [Configuration and Environment Variables](/en/deployment/configuration/)
- [Docker Deployment](/en/deployment/docker/)
