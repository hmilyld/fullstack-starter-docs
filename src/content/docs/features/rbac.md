---
title: 权限系统
description: 基于权限点的 RBAC 模型、默认角色、权限同步与越权保护。
---

接口鉴权基于**权限点（permission code）**，而不是判断角色名称。这样新增角色时无需修改任何接口代码。

- Python 使用 `require_permission(...)` 依赖。
- Java 使用 `@SaCheckPermission(...)` 注解（支持 `SaMode.OR`）。

## 权限码

共 24 个权限码，分为菜单权限与操作权限。完整的权限码目录见[权限码](/reference/permissions/)。

**菜单权限（7 个）**：`dashboard`、`users`、`roles`、`permissions`、`settings`、`ai_models`、`audit_logs`。

**操作权限（17 个）**：`users.create`、`users.edit`、`users.delete`、`users.assign_role`、`roles.create`、`roles.edit`、`roles.delete`、`permissions.create`、`permissions.edit`、`permissions.delete`、`settings.edit`、`ai_models.create`、`ai_models.edit`、`ai_models.delete`、`ai_models.presets.create`、`ai_models.presets.edit`、`ai_models.presets.delete`。

## 默认角色

| 角色 ID | 名称 | 权限 |
| --- | --- | --- |
| `admin` | 管理员 | 全部权限码 |
| `user` | 普通用户 | 仅 `dashboard`、`users`、`settings` |
| `pending_review` | 待审核 | 无 |

三个角色均为预设角色（`is_preset`），**预设角色不可删除**。

`admin` 同时通过两种方式获得全部权限：种子数据直接写入，以及每次启动时同步补齐；运行时对 `admin` 角色还会直接返回全部权限码。

## 权限同步

启动时会将代码中的权限目录（Python 的 `permissions_catalog.py`、Java 的 `PermissionCatalog`）与数据库同步，自动补齐 `admin` 缺失的权限。因此新增权限码后重启后端即可生效。

也可以在权限管理页手动触发同步（`POST /api/permissions/sync`）。

## 越权保护

用户与角色接口内置以下约束：

- 创建或更新用户时，若分配的是非默认角色，必须额外拥有 `users.assign_role` 权限。
- 不能修改自己的角色。
- 非管理员不能修改或删除管理员账号。
- 不能删除最后一个管理员。
- 批量改角色会跳过自己和受保护的管理员账号。

## 前端与后端的分工

- 前端根据权限点过滤菜单，没有对应权限就隐藏入口。
- **后端才是权威**：即使前端隐藏了入口，越权请求仍会被 403 拒绝，并记录审计日志。

## 相关页面

- [权限码](/reference/permissions/)
- [审计日志](/features/audit-logs/)
- [API 接口](/reference/api/)
