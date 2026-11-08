---
title: 权限码
description: 全部权限码及其含义，由后端权限目录自动生成。
---

<!-- 本页表格由 npm run sync:permissions 生成，请勿手工编辑标记之间的内容。 -->

<!-- BEGIN GENERATED: permissions -->
权限码是接口鉴权的唯一依据。共 32 个：9 个菜单权限 + 23 个操作权限。

## 菜单权限

| 权限码 | 名称 |
| --- | --- |
| `dashboard` | 仪表盘 |
| `users` | 用户管理 |
| `roles` | 角色管理 |
| `permissions` | 权限管理 |
| `menus` | 菜单与权限 |
| `settings` | 系统设置 |
| `ai_models` | AI模型配置 |
| `audit_logs` | 审计日志 |
| `data_management` | 数据管理 |

## 操作权限

| 权限码 | 名称 |
| --- | --- |
| `users.create` | 新增用户 |
| `users.edit` | 编辑用户 |
| `users.delete` | 删除用户 |
| `users.assign_role` | 角色维护 |
| `roles.create` | 新增角色 |
| `roles.edit` | 编辑角色 |
| `roles.delete` | 删除角色 |
| `permissions.create` | 新增权限 |
| `permissions.edit` | 编辑权限 |
| `permissions.delete` | 删除权限 |
| `menus.create` | 新增菜单 |
| `menus.edit` | 编辑菜单 |
| `menus.delete` | 删除菜单 |
| `menus.reorder` | 菜单排序 |
| `settings.edit` | 编辑系统设置 |
| `ai_models.create` | 新增AI模型 |
| `ai_models.edit` | 编辑AI模型 |
| `ai_models.delete` | 删除AI模型 |
| `ai_models.presets.create` | 新增预设模型 |
| `ai_models.presets.edit` | 编辑预设模型 |
| `ai_models.presets.delete` | 删除预设模型 |
| `data_management.export` | 导出数据 |
| `data_management.import` | 导入数据 |

## 默认角色映射

| 角色 | 拥有的权限 |
| --- | --- |
| `admin` | 全部 32 个 |
| `user` | `dashboard`、`users`、`settings` |
| `pending_review` | 无 |
<!-- END GENERATED: permissions -->

## 同步

启动时权限目录会与数据库自动同步（并补齐 `admin` 权限）；也可调用 `POST /api/permissions/sync` 手动同步。

菜单权限通过「菜单与权限」页维护，不应通过普通权限 CRUD 单独创建或删除。操作权限也在该页随菜单一起维护。

## 相关页面

- [权限系统](/features/rbac/)
- [菜单与权限](/features/menu-management/)
- [数据管理](/features/data-management/)
- [API 接口](/reference/api/)
