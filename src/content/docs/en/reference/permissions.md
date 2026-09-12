---
title: Permission Codes
description: All 24 permission codes and their meanings.
---

Permission codes are the sole basis for API authorization. There are 24 in total: 7 menu permissions + 17 operation permissions.

## Menu Permissions

| Permission code | Name |
| --- | --- |
| `dashboard` | Dashboard |
| `users` | User Management |
| `roles` | Role Management |
| `permissions` | Permission Management |
| `settings` | System Settings |
| `ai_models` | AI Model Configuration |
| `audit_logs` | Audit Logs |

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
| `settings.edit` | Modify system settings / test email |
| `ai_models.create` | Create model |
| `ai_models.edit` | Edit model |
| `ai_models.delete` | Delete model |
| `ai_models.presets.create` | Create preset |
| `ai_models.presets.edit` | Edit preset |
| `ai_models.presets.delete` | Delete preset |

## Default Role Mapping

| Role | Permissions held |
| --- | --- |
| `admin` | All 24 |
| `user` | `dashboard`, `users`, `settings` |
| `pending_review` | None |

## Sync

At startup, the permission catalog is automatically synchronized with the database (and missing `admin` permissions are filled in); you can also trigger a manual sync with `POST /api/permissions/sync`.

## Related Pages

- [Permission System](/en/features/rbac/)
- [API Reference](/en/reference/api/)
