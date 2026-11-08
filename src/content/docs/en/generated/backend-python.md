---
title: Python Backend
description: Directory layout, migrations, startup flow, security and configuration of the FastAPI template.
---

The Python backend uses FastAPI + SQLAlchemy 2.0 (async) + SQLite. Code is organised by **business domain**, with infrastructure under `app/core/`.

## Directory layout

```
app/
├── main.py                 # App wiring: CORS, middleware, routers, startup migration
├── core/                   # Infrastructure
│   ├── config.py           # Settings and JWT secret validation
│   ├── database.py         # Async engine and session (commit on return, rollback on error)
│   ├── security.py         # bcrypt and JWT signing/verification
│   ├── deps.py             # Dependencies: current user, permission resolution
│   ├── exceptions.py       # Domain exceptions and unified error mapping
│   ├── pagination.py       # Pagination params (clamped)
│   ├── audit.py            # Audit middleware
│   ├── models.py           # Registers every ORM model
│   ├── app_state.py        # Session epoch and menu layout version
│   ├── seed.py             # Seed data
│   └── schemas.py          # ApiResponse / PaginatedData
├── catalogs/               # Permission codes and built-in menus (single source)
│   ├── permissions.py
│   └── menus.py
├── auth/  user/  role/  permission/  menu/
├── system/  ai_model/  audit/  data_management/  dashboard/  public/
└── ...                     # Each domain has models / schemas / service / router
migrations/                 # Alembic migration scripts
tests/                      # Executable contract tests
```

**Routers only map HTTP** (parse input, return the envelope). Business rules and transaction boundaries live in `service.py`. Every domain has a `service.py`; there is no separate `crud.py` layer.

## Database migrations

Schema is managed by **Alembic**, no longer `create_all`:

```bash
cd backend
uv run alembic upgrade head                          # manual upgrade
uv run alembic revision --autogenerate -m "message"  # create a migration
```

The backend runs `upgrade head` automatically on startup, so a restart is enough after pulling changes — no manual `ALTER TABLE`.

## Startup flow

On startup (lifespan) the following run in order:

1. `run_migrations()` — bring the database to the latest revision (Alembic).
2. `seed_data()` — default roles, permissions and users (idempotent).
3. `sync_catalog()` — sync permissions from `app/catalogs/permissions.py` and grant missing ones to `admin`.
4. `sync_menu_catalog()` — add built-in groups and items from `app/catalogs/menus.py` without overwriting existing order.
5. Initialise `app_state` and the menu layout version.
6. `init_default_presets()` — AI model presets when the table is empty.

## Errors and transactions

- Business failures **raise domain exceptions** (`NotFoundError`, `ConflictError`, `InvalidOperationError`, …), mapped by handlers in `main.py` to `{ code: -1, message, data: null }`.
- The session commits on a normal return and rolls back on any exception. There is **no “write first, then return `code: -1`”**.
- Unauthenticated returns `401`, forbidden `403`, validation failure `422`, and `503` while a data import is running.

## Response types

`ApiResponse` and `PaginatedData` are generic, and every endpoint declares a concrete return type:

```python
@router.get("")
async def get_users(...) -> ApiResponse[PaginatedData[UserOut]]:
    return ApiResponse(data=PaginatedData[UserOut](list=users, total=total, page=1, pageSize=10))
```

FastAPI derives the `response_model` from it, so every response in `/openapi.json` is a complete structure (such as `ApiResponse_PaginatedData_UserOut__`) instead of blank. Returning a bare `dict` or omitting the generic degrades the response to a free-form object and fails the contract tests.

## Security

- **Passwords**: bcrypt.
- **Tokens**: PyJWT, HS256, 24-hour default expiry, `sub` is the user ID.
- **Token revocation**: tokens carry `epoch` (global session epoch) and `ver` (per-user token version). Logout, password change and admin password reset bump `users.token_version`, invalidating every existing token for that user.
- **Session epoch**: a successful data import rotates `app_state.session_epoch`, invalidating all old tokens.
- **JWT secret validation**: an empty or weak `JWT_SECRET_KEY` (e.g. `secret`, `123456`, `changeme`) makes startup **fail**; shorter than 32 characters warns but starts.
- **Rate limiting**: login and registration are limited per IP to 5 attempts per minute.
- **Authorization**: endpoints gate on permission codes via `require_permission(...)`, never on role names. The `admin` role resolving to all permissions is implemented once, in `app/core/deps.py`.
- **SSRF protection**: an AI model's `apiUrl` is resolved first, then every resolved address is checked; private, loopback, link-local and cloud-metadata addresses are rejected.

:::danger[Set a strong secret in production]
Before starting the backend, set a strong random secret, for example:

```bash
openssl rand -base64 48
```

Put it in the `JWT_SECRET_KEY` environment variable or `backend/.env`. Changing it invalidates every issued token.
:::

## Configuration

Settings come from environment variables and `backend/.env` (via `pydantic-settings`). See [Configuration](/en/deployment/configuration/) for the full list:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Defaults to `sqlite+aiosqlite:///./app.db`; `/app/data/app.db` in Docker |
| `JWT_SECRET_KEY` | Strong random secret, required and never a weak value |
| `JWT_ALGORITHM` | Defaults to `HS256` |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | Defaults to `1440` |
| `CORS_ORIGINS` | Allowed frontend origins, JSON array |
| `DATA_TMP_DIR` | Import/export temp directory, default `./data/tmp` |
| `MAX_IMPORT_SIZE_BYTES` | Import archive size limit, default 1 GB |

## Running manually

Without `dev.sh`:

```bash
cd backend
uv sync
JWT_SECRET_KEY="$(openssl rand -base64 48)" uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8088
```

Once running:

- API prefix: `http://localhost:8088/api`
- Swagger UI: `http://localhost:8088/docs`
- OpenAPI: `http://localhost:8088/openapi.json`

## Contract tests

The template ships executable contract tests asserting the endpoint set, response envelope, resource shapes and key semantics:

```bash
cd backend
uv sync --extra dev
uv run ruff check .
uv run pytest -q
```

The single source of truth is `docs/contract/api.md` at the repository root; the Java build runs the same assertions.
