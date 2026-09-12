---
title: Default Accounts
description: The administrator and regular user accounts preloaded in generated projects.
---

On first startup, the generated project writes the following accounts, all with the password `123456`.

| Username | Name | Email | Role |
| --- | --- | --- | --- |
| `admin` | Administrator | admin@example.com | `admin` |
| `zhangsan` | Zhang San | zhangsan@example.com | `user` |
| `lisi` | Li Si | lisi@example.com | `user` |
| `wangwu` | Wang Wu | wangwu@example.com | `user` |
| `zhaoliu` | Zhao Liu | zhaoliu@example.com | `user` |

`admin` is the only administrator account and has all permissions. The other four are regular users with only view permission for the three menus `dashboard`, `users`, and `settings`.

:::danger[You must handle the default accounts in production]
- The default password `123456` is for development and debugging only; change the administrator password immediately after deployment.
- Delete or disable sample users you do not need.
- Seed data is idempotent: it is not written again when users or permissions already exist in the database, so changing a password is not reset by a restart.
:::

Newly registered accounts enter the `user` or `pending_review` role according to system settings; see [Authentication and Accounts](/en/features/authentication/).

## Related Pages

- [Quick Start](/en/getting-started/quickstart/)
- [Permission System](/en/features/rbac/)
