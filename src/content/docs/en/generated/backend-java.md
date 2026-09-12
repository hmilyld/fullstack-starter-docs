---
title: Java Backend
description: The Spring Boot template's layered structure, database migrations, authentication, and configuration.
---

The Java backend uses Spring Boot 3.2 + Spring Data JPA + SQLite, with code organized by **layer**.

## Layered Structure

```
src/main/java/com/hmilyld/fullstack/
├── FullstackApplication.java
├── common/            # ApiResponse, PageResult, global exception handling
├── config/            # audit, CORS, Sa-Token, permission catalog and sync task
├── controller/        # 9 controllers: auth / user / role / permission / system ...
├── service/           # Business logic
├── repository/        # Spring Data JPA repositories
├── entity/            # JPA entities
├── dto/               # Request / response objects
└── security/          # RateLimiter, StpInterfaceImpl
```

## Database and Migrations

- The database is a SQLite file, by default `./data/app.db`.
- Schema is managed with **Flyway**: `src/main/resources/db/migration/V1__init.sql` creates tables and writes seed data.
- JPA is set to `ddl-auto: none`, so the schema is controlled entirely by the migration scripts.
- After startup, `PermissionSyncRunner` syncs the permission catalog and fills in the `admin` role's permissions.

## Authentication: Sa-Token

The Java version uses **Sa-Token** server-side session tokens (UUID-style) and **does not need `JWT_SECRET_KEY`**.

- Tokens are valid for 86400 seconds (24 hours) by default.
- `BearerTokenFilter` converts `Authorization: Bearer <token>` into the `satoken` header Sa-Token expects.
- Endpoint permissions are declared with the `@SaCheckPermission(...)` annotation, supporting `SaMode.OR` to combine multiple permission codes.
- `BCrypt` is used for password hashing.

:::caution[Not interchangeable with the Python version's tokens]
Sa-Token's UUID tokens have a different format from the Python version's JWT, so switching backends requires the frontend to log in again.
:::

## Configuration

The configuration file is at `src/main/resources/application.yml`:

| Config | Default | Description |
| --- | --- | --- |
| `server.port` | `8088` | Backend port |
| `spring.datasource.url` | `jdbc:sqlite:./data/app.db` | SQLite file path |
| `spring.jpa.hibernate.ddl-auto` | `none` | Schema managed by Flyway |
| `spring.flyway.enabled` | `true` | Enable migrations |
| `sa-token.token-style` | `uuid` | Token style |
| `sa-token.timeout` | `86400` | Token validity (seconds) |
| `app.cors-origins` | `http://localhost:5173` | Allowed frontend origins |
| `app.audit.exclude-paths` | `/api/auth` | Audit middleware excluded paths |

## Starting Manually

```bash
cd backend
mvn spring-boot:run
```

The backend listens on `http://localhost:8088`. Unlike the Python version, the Java version does not provide built-in Swagger documentation; the code under `controller/` is the source of truth for the API.

## Code Checks

The build script validates formatting with Spotless:

```bash
cd backend && mvn spotless:check
```
