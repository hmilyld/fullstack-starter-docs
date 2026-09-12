---
title: AI 模型与预设
description: 模型配置、API Key 掩码、默认模型、预设分组与连接测试。
---

AI 模型模块用于集中管理后端调用的大模型配置，并提供一组可供选择的预设。

## 配置模型

| 字段 | 说明 |
| --- | --- |
| `alias` | 唯一别名，仅允许字母、数字、下划线、连字符（`^[a-zA-Z0-9_-]+$`） |
| `modelName` | 模型名称，如 `deepseek-v4-flash` |
| `apiUrl` | 接口地址 |
| `apiKey` | 访问密钥 |
| `description` | 描述 |
| `isDefault` | 是否为默认模型 |

设置某个模型为默认时，会自动清除其他模型的默认标记，因此**始终最多只有一个默认模型**。

## API Key 掩码

返回模型信息时，API Key 会被掩码：

- 长度小于 12：返回 `****`。
- 否则返回形如 `ab****yz`。

更新时，掩码值不会被写回数据库，真实密钥不会被覆盖。

## 查询接口

| 方法 | 路径 | 说明 | 认证 |
| --- | --- | --- | --- |
| GET | `/api/ai-models/default` | 默认模型（不含 Key） | 登录 |
| GET | `/api/ai-models/by-alias/:alias` | 按别名查询（不含 Key） | 登录 |
| GET | `/api/ai-models` | 列表（`search`、分页） | `ai_models` |
| POST | `/api/ai-models` | 创建 | `ai_models.create` |
| GET | `/api/ai-models/:id` | 详情 | `ai_models` |
| PUT | `/api/ai-models/:id` | 更新 | `ai_models.edit` |
| DELETE | `/api/ai-models/:id` | 删除 | `ai_models.delete` |
| POST | `/api/ai-models/test` | 连接测试 | `ai_models` |

`default` 与 `by-alias` 返回的公开信息中**不含 API Key**，可以安全用于运行时按别名取用模型。

## 预设

预设是一份可选的模型清单，分为若干分组，例如内置的 `DeepSeek` 与 `小米 MiMo`：

| 分组 | 预设别名 | 默认地址 |
| --- | --- | --- |
| DeepSeek | `deepseek-v4-flash`、`deepseek-v4-pro` | `https://api.deepseek.com/v1/chat/completions` |
| 小米 MiMo | `mimo-v2.5` | `https://api.xiaomi.com/v1/chat/completions` |

预设字段包含分组、别名、模型名、地址、描述、是否激活（`isActive`）与排序值。启用后可按 `sortOrder` 排序展示，供前端的模型选择器使用。

预设的增删改可同时接受 `ai_models.*` 或 `ai_models.presets.*` 两类权限（满足其一即可）。

- `GET /api/ai-models/presets` 列表（支持 `search`、`group`）
- `GET /api/ai-models/presets/groups` 分组
- `GET /api/ai-models/presets/active` 已激活预设（登录即可）
- `POST` / `PUT` / `DELETE` 增删改

## 连接测试

`POST /api/ai-models/test` 会向目标地址发送一次最小化的对话请求（`max_tokens: 10`、`temperature: 0`），超时 30 秒，返回：

```json
{ "success": true, "message": "...", "responseTime": 820, "model": "deepseek-v4-flash" }
```

请求体可以传 `modelId` 复用已保存的地址与密钥，也可以直接传 `apiUrl`、`apiKey`、`modelName` 三个字段。

:::danger[SSRF 防护]
连接测试会拒绝访问非 `http(s)` 地址、`localhost`、`127.0.0.1`、`::1`、云元数据地址（`169.254.169.254`、`metadata.google.internal`）以及私有/回环/链路本地 IP，避免被用于探测内网。
:::

## 相关页面

- [权限码](/reference/permissions/)
- [API 接口](/reference/api/)
