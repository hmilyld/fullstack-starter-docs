---
title: Permission Codes
description: All 32 permission codes and their meanings.
---

Permission codes are the sole basis for API authorization. There are 32 in total: 9 menu permissions and 23 operation permissions.

## Menu Permissions

| Permission code | Name |
| --- | --- |
| `dashboard` | Dashboard |
| `users` | User Management |
| `roles` | Role Management |
| `permissions` | Permission Management |
| `menus` | Menu Management |
| `settings` | System Settings |
| `ai_models` | AI Model Configuration |
| `audit_logs` | Audit Logs |
| `data_management` | Data Management |

## Operation Permissions

| Permission code | Name |
| --- | --- |
| `users.create` | Create user |
| `users.edit` | Edit user |
| `users.delete` | Delete user |
| `users.assign_role` | Assign role (non-default role) |
| `roles.create` | Create role |
| `roles.edit` | Edit role |
| `roles.delete` | Delete role |
| `permissions.create` | Create permission / sync |
| `permissions.edit` | Edit permission |
| `permissions.delete` | Delete permission |
| `menus.create` | Create menu / group |
| `menus.edit` | Edit menu / group |
| `menus.delete` | Delete custom menu / empty group |
| `menus.reorder` | Save menu order |
| `settings.edit` | Modify system settings / test email |
| `ai_models.create` | Create model |
| `ai_models.edit` | Edit model |
| `ai_models.delete` | Delete model |
| `ai_models.presets.create` | Create preset |
| `ai_models.presets.edit` | Edit preset |
| `ai_models.presets.delete` | Delete preset |
| `data_management.export` | Export full data |
| `data_management.import` | Import full data |

## Default Role Mapping

| Role | Permissions held |
| --- | --- |
| `admin` | All 32 |
| `user` | `dashboard`, `users`, `settings` |
| `pending_review` | None |

## Sync

At startup, the permission catalog is automatically synchronized with the database (and missing `admin` permissions are filled in); you can also trigger a manual sync with `POST /api/permissions/sync`.

Menu permissions are managed through the menu-management and data-management pages rather than being created or deleted through general permission CRUD.

## Related Pages

- [Permission System](/en/features/rbac/)
- [Menu Management](/en/features/menu-management/)
- [Data Management](/en/features/data-management/)
- [API Reference](/en/reference/api/)
