---
title: Java Backend
description: Layered structure, migrations, authentication, API docs and configuration of the Spring Boot template.
---

The Java backend uses Spring Boot 3.2 + Spring Data JPA + SQLite, organised **by layer**.

## Layered structure

```
src/main/java/com/hmilyld/fullstack/
├── FullstackApplication.java
├── common/            # ApiResponse, PageResult, domain exceptions, global handler
├── config/            # Spring configuration: CORS, Sa-Token, OpenAPI, audit properties
├── catalog/           # Permission and menu catalogs (plain data, no framework deps)
├── bootstrap/         # Startup sync runners: permissions, menus
├── web/               # Interceptors and filters: audit, bearer token, import freeze
├── data/              # Import job runtime state and executor
├── security/          # RateLimiter, StpInterfaceImpl
├── controller/        # 12 controllers: auth / user / role / permission / menu / data ...
├── service/           # Business logic (throws on failure, so transactions roll back)
├── repository/        # Spring Data JPA repositories
├── entity/            # JPA entities
└── dto/               # Request objects and *Response records
```

Responses always use `dto/*Response` records — **never `Map<String, Object>`**. Controller methods declare a concrete `ApiResponse<T>`; `ApiResponse<?>` is forbidden because the wildcard makes springdoc emit `ApiResponseObject` (`data` is arbitrary JSON), leaving clients unable to generate types.

## Database and migrations

- SQLite file, default `./data/app.db`.
- Schema is managed by **Flyway**:
  - `V1__init.sql`: tables plus role/user seed data
  - `V2__menu_and_app_state.sql`: menu and runtime state tables
  - `V3__menu_hidden.sql`: sidebar visibility
  - `V4__align_with_python.sql`: indexes aligned with Python
  - `V5__remove_seed_permissions.sql`: removes the V1 permission seed (startup sync fills them from the catalog)
- JPA is set to `ddl-auto: none`; migrations fully control the schema.
- On startup `PermissionSyncRunner` syncs permissions, then `MenuSyncRunner` adds built-in menus without overwriting admin-adjusted order.

## Errors and transactions

- Business failures **raise domain exceptions** (`AppException`, `NotFoundException`, `ConflictException`, `InvalidOperationException`, `ForbiddenException`), mapped by `GlobalExceptionHandler`.
- Because failures are exceptions, `@Transactional` methods roll back — there is **no “write first, then return `error`”**.
- The `data` key **always exists** in the envelope (`null` on failure). This requires `@JsonInclude(ALWAYS)` on `ApiResponse` and the global `non_null` filter disabled, otherwise `data`, `parent` and other nullable fields vanish from the JSON.

## Authentication: Sa-Token

The Java build uses **Sa-Token** server-side session tokens (UUID style) and **needs no `JWT_SECRET_KEY`**.

- Default token lifetime is 86400 seconds (24 hours).
- `BearerTokenFilter` converts `Authorization: Bearer <token>` into the `satoken` header Sa-Token expects.
- Login stores the global `session_epoch` in the Sa-Token session, checked against the database on every request; a successful data import invalidates all sessions.
- Logout, password change and admin password reset call `StpUtil.logout(userId)`, revoking all sessions for that user.
- Endpoints gate with `@SaCheckPermission(...)`, supporting `SaMode.OR` for several codes.
- `BCrypt` hashes passwords.
- SSRF protection resolves the hostname first, then rejects private, loopback, link-local and cloud-metadata addresses.

:::caution[Tokens are not interchangeable with Python]
Sa-Token's UUID tokens differ from the Python JWT format; the frontend must log in again when switching backends.
:::

## API docs: SpringDoc

The Java build integrates **SpringDoc OpenAPI 2.5.0** (Spring Boot 3.2.x maps to 2.3.x–2.5.x), with paths deliberately aligned to Python:

| Purpose | URL |
| --- | --- |
| Swagger UI | `http://localhost:8088/docs` |
| OpenAPI description | `http://localhost:8088/openapi.json` |

`config/OpenApiConfig.java` declares only the global title, version and `bearerAuth` scheme — no per-endpoint annotations, since springdoc derives methods, parameters and DTO shapes by reflection. Use the **Authorize** button in Swagger UI with a token from login to call protected endpoints.

## Configuration

Settings live in `src/main/resources/application.yml`:

| Key | Default | Description |
| --- | --- | --- |
| `server.port` | `8088` | Backend port |
| `spring.datasource.url` | `jdbc:sqlite:./data/app.db` | SQLite file path |
| `spring.jpa.hibernate.ddl-auto` | `none` | Schema managed by Flyway |
| `spring.flyway.enabled` | `true` | Enable migrations |
| `spring.jackson.default-property-inclusion` | `always` | Null fields are serialised (contract requirement) |
| `sa-token.token-style` | `uuid` | Token style |
| `sa-token.timeout` | `86400` | Token lifetime (seconds) |
| `app.cors-origins` | `http://localhost:5173` | Allowed frontend origin |
| `app.rate-limit.max-attempts` | `5` | Login/register attempts per minute |
| `app.rate-limit.window-ms` | `60000` | Rate-limit window (ms) |
| `app.audit.exclude-paths` | `/api/auth` | Audit exclusions |
| `app.data.tmp-dir` | `./data/tmp` | Import/export temp directory |
| `app.data.max-import-size-bytes` | `1073741824` | Import archive size limit |
| `springdoc.api-docs.path` | `/openapi.json` | OpenAPI description path |
| `springdoc.swagger-ui.path` | `/docs` | Swagger UI path |
| `spring.servlet.multipart.max-file-size` | `1GB` | Multipart upload limit |

## Running manually

```bash
cd backend
mvn spring-boot:run
```

The backend listens on `http://localhost:8088`, with API docs at `http://localhost:8088/docs`.

## Linting and tests

```bash
cd backend
mvn spotless:apply      # format before committing
mvn spotless:check      # verify formatting
mvn test                # 28 contract assertions
```

Contract tests live in `src/test/java/com/hmilyld/fullstack/ContractTest.java` and assert the same `docs/contract/api.md` as the Python build.
