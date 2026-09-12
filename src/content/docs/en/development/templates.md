---
title: Template Conventions
description: The organization and naming conventions to follow when maintaining the templates/ directory.
---

The heart of the scaffold is the `templates/` directory: the files inside it are exactly what users end up with. Modifying a template is the same as modifying a generated project.

## Each Stack Keeps Its Own Conventions

The directory organization of different stacks is **deliberately not unified**, and instead follows each language's community conventions:

| Template | Organization |
| --- | --- |
| `backend-python/` | Domain-modular: `app/core/` (infrastructure) + one package per business domain (`auth/`, `user/`, `role/`, …), each containing `models.py` / `schemas.py` / `crud.py` / `router.py` |
| `backend-java/` | Layered: `controller/`, `service/`, `repository/`, `entity/`, `dto/`, plus `common/`, `config/`, `security/` |
| `frontend-react/` and `frontend-vue/` | Feature-based: pages under `pages/settings/<Domain>/`, APIs split by domain under `api/`, types split by domain under `types/` |

## Naming and Copy

- Frontend and backend UI copy uniformly uses **Chinese**.
- API responses are fixed as `{ code: 0, message: "success", data }`, with `code: -1` for errors.
- TS/JS variables use `camelCase`, and components use `PascalCase`.
- Python Pydantic schema fields use `camelCase` (such as `roleId`), and ORM fields use `snake_case` (such as `role_id`).

## Shared Infrastructure

- Python's `ApiResponse` / `PaginatedData` live in `app/core/schemas.py`.
- The permission code catalog is the single source of truth: Python `app/core/permissions_catalog.py`, Java `config/PermissionCatalog.java`.
- The frontend HTTP layer is a lightweight fetch wrapper (`api/client.ts`); **do not introduce axios**.

## Related Pages

- [Adding Templates](/en/development/adding-templates/)
- [Testing and Verification](/en/development/testing/)
