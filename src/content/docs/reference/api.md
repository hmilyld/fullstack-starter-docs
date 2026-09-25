---
title: API 接口
description: 全部接口一览、统一响应格式与认证说明。
---

除文件下载接口外，所有接口前缀为 `/api`，统一返回：

```json
{ "code": 0, "message": "success", "data": {} }
```

出错时 `code` 为 `-1`，`message` 为中文提示。分页接口的 `data` 为 `{ list, total, page, pageSize }`。

`POST /api/data/export` 成功时返回 `application/zip` 文件；一次性随机密码通过 `X-Export-Password` 响应头返回。

## 认证说明

下表「认证」列的含义：

- `否`：无需登录。
- `是`：登录即可。
- `是(权限码)`：需登录且拥有对应权限点。
- `一次性任务令牌`：不使用登录令牌，需携带创建任务时返回的 `X-Import-Job-Token`。

Python 版未登录返回 401；两栈行为一致，除 `logout` 外：Java 版未登录调用也返回成功。

## 认证

| 方法 | 路径 | 说明 | 认证 |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | 登录 | 否 |
| POST | `/api/auth/register` | 注册（受开放注册/人工审核控制） | 否 |
| POST | `/api/auth/logout` | 登出 | 是¹ |

## 用户

| 方法 | 路径 | 说明 | 认证 |
| --- | --- | --- | --- |
| GET | `/api/users` | 用户列表（分页 + 搜索） | 是(`users`) |
| GET | `/api/users/:id` | 用户详情 | 是(`users`) |
| POST | `/api/users` | 创建用户 | 是(`users.create`)² |
| PUT | `/api/users/:id` | 更新用户 | 是(`users.edit`) |
| DELETE | `/api/users/:id` | 删除用户 | 是(`users.delete`) |
| PUT | `/api/users/:id/reset-password` | 重置密码 | 是(`users.edit`) |
| POST | `/api/users/batch-role` | 批量设置角色 | 是(`users.edit` 或 `users.assign_role`) |
| PUT | `/api/users/me` | 修改个人资料 | 是 |
| PUT | `/api/users/me/password` | 修改密码 | 是 |

## 角色与权限

| 方法 | 路径 | 说明 | 认证 |
| --- | --- | --- | --- |
| GET | `/api/roles` | 角色列表（分页 + 搜索） | 是(`roles`) |
| POST | `/api/roles` | 创建角色 | 是(`roles.create`) |
| PUT | `/api/roles/:id` | 更新角色 | 是(`roles.edit`) |
| DELETE | `/api/roles/:id` | 删除角色（预设角色不可删） | 是(`roles.delete`) |
| GET | `/api/permissions` | 权限列表 | 是(`permissions`) |
| POST | `/api/permissions` | 创建权限 | 是(`permissions.create`) |
| POST | `/api/permissions/sync` | 与权限目录同步 | 是(`permissions.create`) |
| PUT | `/api/permissions/:code` | 更新权限 | 是(`permissions.edit`) |
| DELETE | `/api/permissions/:code` | 删除权限 | 是(`permissions.delete`) |

> 菜单权限不能通过本接口创建或删除；请使用菜单管理接口维护菜单和对应权限。

## 菜单管理

| 方法 | 路径 | 说明 | 认证 |
| --- | --- | --- | --- |
| GET | `/api/menus/navigation` | 当前用户可见的动态侧边栏 | 是 |
| GET | `/api/menus` | 完整菜单配置与布局版本 | 是(`menus`) |
| POST | `/api/menus/groups` | 创建自定义分组 | 是(`menus.create`) |
| PUT | `/api/menus/groups/:id` | 重命名分组 | 是(`menus.edit`) |
| DELETE | `/api/menus/groups/:id` | 删除空的自定义分组 | 是(`menus.delete`) |
| POST | `/api/menus/items` | 创建自定义菜单及权限 | 是(`menus.create`) |
| PUT | `/api/menus/items/:code` | 更新菜单名称、分组、路由或图标 | 是(`menus.edit`) |
| DELETE | `/api/menus/items/:code` | 删除自定义菜单及授权 | 是(`menus.delete`) |
| PUT | `/api/menus/layout` | 原子保存分组和菜单顺序 | 是(`menus.reorder`) |

## 仪表盘

| 方法 | 路径 | 说明 | 认证 |
| --- | --- | --- | --- |
| GET | `/api/dashboard/stats` | 统计卡片 | 是(`dashboard`) |
| GET | `/api/dashboard/activity` | 近期活动 | 是(`dashboard`) |

## 系统设置

| 方法 | 路径 | 说明 | 认证 |
| --- | --- | --- | --- |
| GET | `/api/system/config` | 读取配置 | 是(`settings`) |
| PUT | `/api/system/config` | 更新配置 | 是(`settings.edit`) |
| POST | `/api/system/test-email` | 测试邮件 | 是(`settings.edit`) |
| GET | `/api/public/config` | 公开配置（登录页用） | 否 |

## AI 模型

| 方法 | 路径 | 说明 | 认证 |
| --- | --- | --- | --- |
| GET | `/api/ai-models` | 模型列表 | 是(`ai_models`) |
| POST | `/api/ai-models` | 创建模型 | 是(`ai_models.create`) |
| GET | `/api/ai-models/default` | 默认模型 | 登录 |
| GET | `/api/ai-models/by-alias/:alias` | 按别名查询 | 登录 |
| GET | `/api/ai-models/:id` | 模型详情 | 是(`ai_models`) |
| PUT | `/api/ai-models/:id` | 更新模型 | 是(`ai_models.edit`) |
| DELETE | `/api/ai-models/:id` | 删除模型 | 是(`ai_models.delete`) |
| POST | `/api/ai-models/test` | 连接测试 | 是(`ai_models`) |
| GET | `/api/ai-models/presets` | 预设列表 | 是(`ai_models`) |
| GET | `/api/ai-models/presets/groups` | 预设分组 | 是(`ai_models`) |
| GET | `/api/ai-models/presets/active` | 当前激活预设 | 登录 |
| GET | `/api/ai-models/presets/:id` | 预设详情 | 是(`ai_models`) |
| POST | `/api/ai-models/presets` | 创建预设 | 是(`ai_models.create` 或 `ai_models.presets.create`) |
| PUT | `/api/ai-models/presets/:id` | 更新预设 | 是(`ai_models.edit` 或 `ai_models.presets.edit`) |
| DELETE | `/api/ai-models/presets/:id` | 删除预设 | 是(`ai_models.delete` 或 `ai_models.presets.delete`) |

## 审计日志

| 方法 | 路径 | 说明 | 认证 |
| --- | --- | --- | --- |
| GET | `/api/audit-logs` | 日志列表（按用户/状态/动作/时间筛选 + 分页） | 是(`audit_logs`) |

## 数据管理

| 方法 | 路径 | 说明 | 认证 |
| --- | --- | --- | --- |
| POST | `/api/data/export` | 下载 AES-256 加密的完整导出包 | 是(`data_management.export`) |
| POST | `/api/data/import` | 上传并创建完整导入任务 | 是(`data_management.import`) |
| GET | `/api/data/import/:id` | 查询导入状态 | `X-Import-Job-Token` |

导入期间除状态接口外的普通请求返回 503。导入成功后全局会话世代更新，所有用户必须重新登录。详见[数据管理](/features/data-management/)。

---

> **注 1**：Python 版 `logout` 需登录；Java 版兼容未登录调用。
>
> **注 2**：创建非默认角色的用户还需 `users.assign_role` 权限。

## 相关页面

- [权限码](/reference/permissions/)
- [权限系统](/features/rbac/)
