---
title: 审计日志
description: 审计日志记录哪些操作、字段结构以及如何筛选。
---

审计日志用于追踪系统中的写操作与权限拦截，便于排查与合规。

## 记录范围

中间件（Python 为 `AuditMiddleware`，Java 为 `AuditInterceptor`）对 `/api/` 下的请求进行记录：

- **写方法**：`POST`、`PUT`、`DELETE`、`PATCH`，状态记为 `success`。
- **任何 403 响应**：状态记为 `permission_denied`，无论请求方法。
- `/api/auth/*` 被中间件排除，改由业务代码显式记录，避免重复。

认证相关的操作由业务代码显式写入：

| 动作 `action` | 触发时机 |
| --- | --- |
| `login` | 登录成功或失败（凭据错误、待审核、维护中） |
| `register` | 注册成功或失败（注册关闭、用户名/邮箱已存在） |
| `logout` | 登出 |

普通写操作的 `action` 形如 `"POST /api/users"`，即「方法 + 路径」。

## 日志字段

| 字段 | 说明 |
| --- | --- |
| `userId` / `username` | 操作人 |
| `action` | 动作或「方法 + 路径」 |
| `ip` | 客户端 IP |
| `status` | `success` 或 `permission_denied` |
| `detail` | 详情 |
| `createdAt` | 时间 |

`user_id`、`status`、`created_at` 建有索引。

## 客户端 IP

IP 解析顺序：

1. `X-Real-IP`（由 Nginx 设置，不可伪造）
2. `X-Forwarded-For` 的第一段
3. 直连地址

## 查询与筛选

| 方法 | 路径 | 说明 | 认证 |
| --- | --- | --- | --- |
| GET | `/api/audit-logs` | 日志列表 | 是（`audit_logs`） |

支持的查询参数：

| 参数 | 说明 |
| --- | --- |
| `userId` | 按用户筛选 |
| `status` | 按状态筛选 |
| `action` | 按动作模糊匹配 |
| `startTime` / `endTime` | 按时间范围筛选 |
| `page` / `pageSize` | 分页（`pageSize` 上限 100） |

结果按 `createdAt` 倒序返回。若日志中的用户名缺失，会联表 `users` 补全。

:::note
审计写入失败是静默的，不会影响正常请求。日志本身也不在 `/api/audit-logs` 之外的接口中自动清理，请根据数据量自行规划归档策略。
:::

## 相关页面

- [权限系统](/features/rbac/)
- [API 接口](/reference/api/)
