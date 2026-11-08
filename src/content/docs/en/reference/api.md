---
title: API Reference
description: A complete endpoint list, the uniform response format, and authentication notes.
---

Except for file downloads, all endpoints are prefixed with `/api` and return uniformly:

```json
{ "code": 0, "message": "success", "data": {} }
```

On error, `code` is `-1` and `message` is a Chinese message. For paginated endpoints, `data` is `{ list, total, page, pageSize }`.

The `data` key **always exists**: it is `null` on business failure and for successful responses without a payload. Both stacks behave identically here.

Out-of-range `page` and `pageSize` are **clamped** to valid values (`page >= 1`, `pageSize` 1–100) rather than rejected.

Every endpoint's response shape appears in `/openapi.json`, so client types can be generated from it. Both stacks use the same URLs: Swagger UI at `/docs`, the OpenAPI description at `/openapi.json`.

`POST /api/data/export` returns an `application/zip` file on success. The one-time random password is returned in the `X-Export-Password` response header.

## Authentication Notes

Meaning of the "Auth" column in the tables below:

- `No`: no login required.
- `Yes`: login required.
- `Yes(permission)`: login required and the corresponding permission point must be held.
- `One-time job token`: login is not used; the request must include the `X-Import-Job-Token` returned when the import job was created.

Both stacks behave identically: unauthenticated returns `401`, forbidden `403`, validation failure `422`. The only implementation difference is the token format (JWT vs Sa-Token), which is transparent to callers.

## Authentication

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | Log in | No |
| POST | `/api/auth/register` | Register (controlled by open registration / manual review) | No |
| POST | `/api/auth/logout` | Log out (revokes the current token immediately) | Yes¹ |

## Users

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/users` | User list (pagination + search) | Yes(`users`) |
| GET | `/api/users/:id` | User details | Yes(`users`) |
| POST | `/api/users` | Create user | Yes(`users.create`)² |
| PUT | `/api/users/:id` | Update user | Yes(`users.edit`) |
| DELETE | `/api/users/:id` | Delete user | Yes(`users.delete`) |
| PUT | `/api/users/:id/reset-password` | Reset password | Yes(`users.edit`) |
| POST | `/api/users/batch-role` | Batch set roles | Yes(`users.edit` or `users.assign_role`) |
| PUT | `/api/users/me` | Update own profile | Yes |
| PUT | `/api/users/me/password` | Change password | Yes |

## Roles and Permissions

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/roles` | Role list (pagination + search) | Yes(`roles`) |
| POST | `/api/roles` | Create role | Yes(`roles.create`) |
| PUT | `/api/roles/:id` | Update role | Yes(`roles.edit`) |
| DELETE | `/api/roles/:id` | Delete role (preset roles cannot be deleted) | Yes(`roles.delete`) |
| GET | `/api/permissions` | Permission list | Yes(`permissions`) |
| GET | `/api/permissions?type=menu` | Menu permission list | Yes(`permissions`) |
| GET | `/api/permissions?type=operation` | Operation permission list | Yes(`permissions`) |
| POST | `/api/permissions` | Create permission | Yes(`permissions.create`) |
| POST | `/api/permissions/sync` | Sync with the permission catalog | Yes(`permissions.create`) |
| PUT | `/api/permissions/:code` | Update permission | Yes(`permissions.edit`) |
| DELETE | `/api/permissions/:code` | Delete permission | Yes(`permissions.delete`) |

> Menu permissions cannot be created or deleted through this API. Use the Menu & Permissions endpoints below. An operation permission's `parent` must reference an existing menu permission.

## Menu & Permissions

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/menus/navigation` | Dynamic sidebar visible to the current user | Login |
| GET | `/api/menus` | Complete menu configuration, operation permissions, and layout version | Yes(`menus` or `permissions`) |
| POST | `/api/menus/groups` | Create a custom group | Yes(`menus.create`) |
| PUT | `/api/menus/groups/:id` | Rename a group | Yes(`menus.edit`) |
| DELETE | `/api/menus/groups/:id` | Delete an empty custom group | Yes(`menus.delete`) |
| POST | `/api/menus/items` | Create a custom item and permission | Yes(`menus.create`) |
| PUT | `/api/menus/items/:code` | Update item metadata or visibility | Yes(`menus.edit`) |
| DELETE | `/api/menus/items/:code` | Delete a custom item, its operation permissions, and grants | Yes(`menus.delete`) |
| PUT | `/api/menus/layout` | Atomically save group and item order | Yes(`menus.reorder`) |

## Dashboard

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/dashboard/stats` | Stat cards | Yes(`dashboard`) |
| GET | `/api/dashboard/activity` | Recent activity | Yes(`dashboard`) |

## System Settings

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/system/config` | Read configuration | Yes(`settings`) |
| PUT | `/api/system/config` | Update configuration | Yes(`settings.edit`) |
| POST | `/api/system/test-email` | Test email | Yes(`settings.edit`) |
| GET | `/api/public/config` | Public configuration (used by the login page) | No |

## AI Models

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/ai-models` | Model list | Yes(`ai_models`) |
| POST | `/api/ai-models` | Create model | Yes(`ai_models.create`) |
| GET | `/api/ai-models/default` | Default model | Login |
| GET | `/api/ai-models/by-alias/:alias` | Query by alias | Login |
| GET | `/api/ai-models/:id` | Model details | Yes(`ai_models`) |
| PUT | `/api/ai-models/:id` | Update model | Yes(`ai_models.edit`) |
| DELETE | `/api/ai-models/:id` | Delete model | Yes(`ai_models.delete`) |
| POST | `/api/ai-models/test` | Connection test | Yes(`ai_models`) |
| GET | `/api/ai-models/presets` | Preset list | Yes(`ai_models`) |
| GET | `/api/ai-models/presets/groups` | Preset groups | Yes(`ai_models`) |
| GET | `/api/ai-models/presets/active` | Currently active presets | Login |
| GET | `/api/ai-models/presets/:id` | Preset details | Yes(`ai_models`) |
| POST | `/api/ai-models/presets` | Create preset | Yes(`ai_models.create` or `ai_models.presets.create`) |
| PUT | `/api/ai-models/presets/:id` | Update preset | Yes(`ai_models.edit` or `ai_models.presets.edit`) |
| DELETE | `/api/ai-models/presets/:id` | Delete preset | Yes(`ai_models.delete` or `ai_models.presets.delete`) |

## Audit Logs

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/audit-logs` | Log list (filter by user/status/action/time + pagination) | Yes(`audit_logs`) |

## Data Management

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/data/export` | Download an AES-256 encrypted full export | Yes(`data_management.export`) |
| POST | `/api/data/import` | Upload and create a full import job | Yes(`data_management.import`) |
| GET | `/api/data/import/:id` | Query import status | `X-Import-Job-Token` |

During import, ordinary requests return 503 except the status endpoint. A successful import rotates the global session epoch, requiring every user to log in again. See [Data Management](/en/features/data-management/).

---

> **Note 1**: Logout requires login and immediately invalidates the current token; requests with the old token afterwards return `401`.
>
> **Note 2**: Creating a user with a non-default role also requires the `users.assign_role` permission.

## Related Pages

- [Permission Codes](/en/reference/permissions/)
- [Permission System](/en/features/rbac/)
