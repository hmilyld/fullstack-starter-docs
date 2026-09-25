---
title: Permission System
description: A permission-point-based RBAC model, default roles, permission sync, and privilege-escalation protection.
---

API authorization is based on **permission codes**, not on checking role names. This means no endpoint code needs to change when you add a new role.

- Python uses the `require_permission(...)` dependency.
- Java uses the `@SaCheckPermission(...)` annotation (supports `SaMode.OR`).

## Permission Codes

There are 32 permission codes in total: 9 menu permissions and 23 operation permissions. The complete catalog is in [Permission Codes](/en/reference/permissions/).

**Menu permissions (9)**: `dashboard`, `users`, `roles`, `permissions`, `menus`, `settings`, `ai_models`, `audit_logs`, `data_management`.

**Operation permissions (23)**: `users.create`, `users.edit`, `users.delete`, `users.assign_role`, `roles.create`, `roles.edit`, `roles.delete`, `permissions.create`, `permissions.edit`, `permissions.delete`, `menus.create`, `menus.edit`, `menus.delete`, `menus.reorder`, `settings.edit`, `ai_models.create`, `ai_models.edit`, `ai_models.delete`, `ai_models.presets.create`, `ai_models.presets.edit`, `ai_models.presets.delete`, `data_management.export`, `data_management.import`.

Menu permissions must be created through menu management or synchronized from the built-in menu catalog. The general permission API does not create or delete them, preventing an authorization record with no sidebar presentation metadata.

## Default Roles

| Role ID | Name | Permissions |
| --- | --- | --- |
| `admin` | Administrator | All permission codes |
| `user` | Regular user | Only `dashboard`, `users`, `settings` |
| `pending_review` | Pending review | None |

All three roles are preset roles (`is_preset`), and **preset roles cannot be deleted**.

`admin` obtains all permissions in two ways at once: the seed data writes them directly, and they are synced and filled in on every startup; at runtime the `admin` role also directly returns all permission codes.

## Permission Sync

At startup, the permission catalog in code (Python's `permissions_catalog.py`, Java's `PermissionCatalog`) is synchronized with the database, automatically filling in any permissions missing from `admin`. So after adding a permission code, restarting the backend is enough for it to take effect.

You can also trigger a sync manually from the permission management page (`POST /api/permissions/sync`).

## Privilege-Escalation Protection

The user and role endpoints have the following constraints built in:

- When creating or updating a user, assigning a non-default role requires the `users.assign_role` permission in addition.
- You cannot change your own role.
- Non-administrators cannot modify or delete administrator accounts.
- The last administrator cannot be deleted.
- Batch role changes skip yourself and protected administrator accounts.

## Division of Labor Between Frontend and Backend

- The frontend filters menus by permission point, hiding entries for which the user lacks permission.
- **The backend is authoritative**: even if the frontend hides an entry, unauthorized requests are still rejected with 403 and recorded in the audit log.

## Related Pages

- [Permission Codes](/en/reference/permissions/)
- [Menu Management](/en/features/menu-management/)
- [Data Management](/en/features/data-management/)
- [Audit Logs](/en/features/audit-logs/)
- [API Reference](/en/reference/api/)
