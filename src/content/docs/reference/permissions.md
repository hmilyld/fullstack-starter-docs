---
title: 权限码
description: 全部 24 个权限码及其含义。
---

权限码是接口鉴权的唯一依据。共 24 个：7 个菜单权限 + 17 个操作权限。

## 菜单权限

| 权限码 | 名称 |
| --- | --- |
| `dashboard` | 仪表盘 |
| `users` | 用户管理 |
| `roles` | 角色管理 |
| `permissions` | 权限管理 |
| `settings` | 系统设置 |
| `ai_models` | AI 模型配置 |
| `audit_logs` | 审计日志 |

## 操作权限

| 权限码 | 名称 |
| --- | --- |
| `users.create` | 创建用户 |
| `users.edit` | 编辑用户 |
| `users.delete` | 删除用户 |
| `users.assign_role` | 分配角色（非默认角色） |
| `roles.create` | 创建角色 |
| `roles.edit` | 编辑角色 |
| `roles.delete` | 删除角色 |
| `permissions.create` | 创建权限 / 同步 |
| `permissions.edit` | 编辑权限 |
| `permissions.delete` | 删除权限 |
| `settings.edit` | 修改系统设置 / 测试邮件 |
| `ai_models.create` | 创建模型 |
| `ai_models.edit` | 编辑模型 |
| `ai_models.delete` | 删除模型 |
| `ai_models.presets.create` | 创建预设 |
| `ai_models.presets.edit` | 编辑预设 |
| `ai_models.presets.delete` | 删除预设 |

## 默认角色映射

| 角色 | 拥有的权限 |
| --- | --- |
| `admin` | 全部 24 个 |
| `user` | `dashboard`、`users`、`settings` |
| `pending_review` | 无 |

## 同步

启动时权限目录会与数据库自动同步（并补齐 `admin` 权限）；也可调用 `POST /api/permissions/sync` 手动同步。

## 相关页面

- [权限系统](/features/rbac/)
- [API 接口](/reference/api/)
