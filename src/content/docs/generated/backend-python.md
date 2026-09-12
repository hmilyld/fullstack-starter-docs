---
title: Python 后端
description: FastAPI 模板的目录组织、启动流程、安全与配置。
---

Python 后端使用 FastAPI + SQLAlchemy 2.0（async）+ SQLite，按**业务域**组织代码，基础设施统一放在 `app/core/`。

## 目录组织

```
app/
├── main.py                 # 应用装配：CORS、审计中间件、路由注册
├── core/                   # 基础设施
│   ├── config.py           # 配置与 JWT 密钥校验
│   ├── database.py         # async 引擎与会话
│   ├── security.py         # bcrypt 与 JWT 签发/校验
│   ├── deps.py             # 依赖：当前用户、权限校验
│   ├── audit.py            # 审计中间件
│   ├── permissions_catalog.py  # 权限码目录（唯一来源）
│   ├── seed.py             # 种子数据
│   └── schemas.py          # ApiResponse / PaginatedData
├── auth/  user/  role/  permission/
├── system/  ai_model/  audit/  dashboard/  public/
└── ...                     # 每个域含 models / schemas / crud / router
```

## 启动流程

应用启动（lifespan）时依次执行：

1. `init_db()` —— 建表（`create_all`）。
2. `seed_data()` —— 写入默认角色、权限与用户（幂等：已有数据则跳过）。
3. `sync_permissions()` —— 将权限目录与数据库同步，并补齐 `admin` 角色缺失的权限。
4. `init_default_presets()` —— 初始化 AI 模型预设（表为空时）。

## 安全

- **密码**：bcrypt 哈希。
- **令牌**：PyJWT，HS256，默认有效期 1440 分钟（24 小时），`sub` 为用户名 ID。
- **JWT 密钥校验**：`JWT_SECRET_KEY` 为空或属于弱密钥集合（如 `secret`、`123456`、`changeme`）时**拒绝启动**；长度不足 32 会警告但仍启动。
- **速率限制**：登录与注册按 IP 限制，每分钟最多 5 次，超出返回中文提示。
- **权限**：接口通过 `require_permission(...)` 依赖按权限码鉴权，而非判断角色名。

:::danger[生产环境必须设置强密钥]
启动后端前请设置强随机密钥，例如：

```bash
openssl rand -base64 48
```

将其写入环境变量 `JWT_SECRET_KEY` 或 `backend/.env`。密钥变更会使所有已签发令牌失效。
:::

## 配置

配置读取自环境变量与 `backend/.env`（基于 `pydantic-settings`）。完整变量见[配置与环境变量](/deployment/configuration/)：

| 变量 | 说明 |
| --- | --- |
| `DATABASE_URL` | 默认 `sqlite+aiosqlite:///./app.db`，Docker 中指向 `/app/data/app.db` |
| `JWT_SECRET_KEY` | 强随机密钥，必填且不可为弱值 |
| `JWT_ALGORITHM` | 默认 `HS256` |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | 默认 `1440` |
| `CORS_ORIGINS` | 允许的前端来源，JSON 数组 |

## 手动启动

不使用 `dev.sh` 时：

```bash
cd backend
uv sync
JWT_SECRET_KEY="$(openssl rand -base64 48)" uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8088
```

启动后可访问：

- 前端接口前缀：`http://localhost:8088/api`
- Swagger 文档：`http://localhost:8088/docs`
- OpenAPI：`http://localhost:8088/openapi.json`
