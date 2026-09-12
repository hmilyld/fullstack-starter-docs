---
title: Python Backend
description: The FastAPI template's directory organization, startup flow, security, and configuration.
---

The Python backend uses FastAPI + SQLAlchemy 2.0 (async) + SQLite, organizing code by **business domain**, with infrastructure kept together under `app/core/`.

## Directory Organization

```
app/
├── main.py                 # Application assembly: CORS, audit middleware, route registration
├── core/                   # Infrastructure
│   ├── config.py           # Configuration and JWT key validation
│   ├── database.py         # async engine and session
│   ├── security.py         # bcrypt and JWT signing/verification
│   ├── deps.py             # Dependencies: current user, permission checks
│   ├── audit.py            # Audit middleware
│   ├── permissions_catalog.py  # Permission code catalog (single source of truth)
│   ├── seed.py             # Seed data
│   └── schemas.py          # ApiResponse / PaginatedData
├── auth/  user/  role/  permission/
├── system/  ai_model/  audit/  dashboard/  public/
└── ...                     # each domain contains models / schemas / crud / router
```

## Startup Flow

On application startup (lifespan), the following run in order:

1. `init_db()` — create tables (`create_all`).
2. `seed_data()` — write default roles, permissions, and users (idempotent: skipped if data already exists).
3. `sync_permissions()` — sync the permission catalog with the database and fill in permissions missing from the `admin` role.
4. `init_default_presets()` — initialize AI model presets (when the table is empty).

## Security

- **Passwords**: bcrypt hashing.
- **Tokens**: PyJWT, HS256, valid for 1440 minutes (24 hours) by default, with `sub` as the user ID.
- **JWT key validation**: if `JWT_SECRET_KEY` is empty or belongs to the weak-key set (such as `secret`, `123456`, `changeme`), startup is **refused**; a length under 32 triggers a warning but still starts.
- **Rate limiting**: login and registration are limited by IP to at most 5 times per minute; exceeding this returns a Chinese message.
- **Permissions**: endpoints authorize by permission code via the `require_permission(...)` dependency, not by checking role names.

:::danger[You must set a strong key in production]
Set a strong, random key before starting the backend, for example:

```bash
openssl rand -base64 48
```

Write it to the `JWT_SECRET_KEY` environment variable or `backend/.env`. Changing the key invalidates all already-issued tokens.
:::

## Configuration

Configuration is read from environment variables and `backend/.env` (based on `pydantic-settings`). See [Configuration and Environment Variables](/en/deployment/configuration/) for the complete list:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Defaults to `sqlite+aiosqlite:///./app.db`; points to `/app/data/app.db` in Docker |
| `JWT_SECRET_KEY` | Strong random key; required and must not be a weak value |
| `JWT_ALGORITHM` | Defaults to `HS256` |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | Defaults to `1440` |
| `CORS_ORIGINS` | Allowed frontend origins, as a JSON array |

## Starting Manually

Without using `dev.sh`:

```bash
cd backend
uv sync
JWT_SECRET_KEY="$(openssl rand -base64 48)" uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8088
```

After startup you can access:

- Frontend API prefix: `http://localhost:8088/api`
- Swagger docs: `http://localhost:8088/docs`
- OpenAPI: `http://localhost:8088/openapi.json`
