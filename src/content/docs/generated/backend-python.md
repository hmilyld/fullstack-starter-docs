---
title: Python 后端
description: FastAPI 模板的目录组织、迁移、启动流程、安全与配置。
---

Python 后端使用 FastAPI + SQLAlchemy 2.0（async）+ SQLite，按**业务域**组织代码，基础设施统一放在 `app/core/`。

## 目录组织

```
app/
├── main.py                 # 应用装配：CORS、中间件、路由注册、启动迁移
├── core/                   # 基础设施
│   ├── config.py           # 配置与 JWT 密钥校验
│   ├── database.py         # async 引擎与会话（正常返回提交，异常回滚）
│   ├── security.py         # bcrypt 与 JWT 签发/校验
│   ├── deps.py             # 依赖：当前用户、权限解析、require_permission
│   ├── exceptions.py       # 领域异常与统一错误映射
│   ├── pagination.py       # 分页参数（越界钳制）
│   ├── audit.py            # 审计中间件
│   ├── models.py           # 集中注册全部 ORM 模型
│   ├── permissions_catalog.py  # 权限码目录（唯一来源）
│   ├── menu_catalog.py     # 内置菜单与分组目录
│   ├── app_state.py        # 会话世代与菜单布局版本
│   ├── seed.py             # 种子数据
│   └── schemas.py          # ApiResponse / PaginatedData
├── auth/  user/  role/  permission/  menu/
├── system/  ai_model/  audit/  data_management/  dashboard/  public/
└── ...                     # 每个域含 models / schemas / service / router
migrations/                 # Alembic 迁移脚本
tests/                      # 可执行契约测试
```

**router 只做 HTTP 映射**（解析入参、返回信封），业务规则与事务边界在 `service.py`。`user/` 另外保留了 `crud.py` 作为纯数据访问层。

## 数据库迁移

结构由 **Alembic** 管理，不再使用 `create_all`：

```bash
cd backend
uv run alembic upgrade head                          # 手动升级
uv run alembic revision --autogenerate -m "说明"      # 生成迁移
```

后端启动时会自动执行 `upgrade head`，因此升级代码后直接重启即可，不需要手工 `ALTER TABLE`。

## 启动流程

应用启动（lifespan）时依次执行：

1. `run_migrations()` —— 将数据库升级到最新版本（Alembic）。
2. `seed_data()` —— 写入默认角色、权限与用户（幂等：已有数据则跳过）。
3. `sync_catalog()` —— 将权限目录与数据库同步，并补齐 `admin` 角色缺失的权限。
4. `sync_menu_catalog()` —— 补齐内置菜单分组和菜单项，不覆盖已有顺序。
5. 初始化 `app_state` 与菜单布局版本。
6. `init_default_presets()` —— 初始化 AI 模型预设（表为空时）。

## 错误与事务

- 业务失败**抛领域异常**（`NotFoundError`、`ConflictError`、`InvalidOperationError` 等），由 `main.py` 的异常处理器统一映射为 `{ code: -1, message, data: null }`。
- 数据库会话在请求正常返回时提交，抛异常时回滚。因此**不会出现「先写库再返回 `code: -1`」**。
- 未认证返回 `401`，无权限返回 `403`，参数校验失败返回 `422`，导入冻结期间返回 `503`。

## 安全

- **密码**：bcrypt 哈希。
- **令牌**：PyJWT，HS256，默认有效期 1440 分钟（24 小时），`sub` 为用户 ID。
- **令牌吊销**：令牌携带 `epoch`（全局会话世代）与 `ver`（用户令牌版本）。登出、修改密码、管理员重置密码都会递增 `users.token_version`，使该用户所有既有令牌立即失效。
- **会话世代**：数据导入成功后会轮换 `app_state.session_epoch`，立即使所有旧令牌失效。
- **JWT 密钥校验**：`JWT_SECRET_KEY` 为空或属于弱密钥集合（如 `secret`、`123456`、`changeme`）时**拒绝启动**；长度不足 32 会警告但仍启动。
- **速率限制**：登录与注册按 IP 限制，每分钟最多 5 次，超出返回中文提示。
- **权限**：接口通过 `require_permission(...)` 依赖按权限码鉴权，而非判断角色名。`admin` 角色视为拥有全部权限，该判断只在 `app/core/deps.py` 中实现一次。
- **SSRF 防护**：AI 模型的 `apiUrl` 会先解析域名，再逐条判定解析结果，拒绝内网、回环、链路本地地址与云元数据端点。

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
| `DATA_TMP_DIR` | 导入导出临时目录，默认 `./data/tmp` |
| `MAX_IMPORT_SIZE_BYTES` | 导入包大小上限，默认 1 GB |

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

## 契约测试

模板自带可执行的契约测试，断言端点集合、响应信封、资源形状与关键语义：

```bash
cd backend
uv sync --extra dev
uv run ruff check .
uv run pytest -q
```

契约的唯一来源是仓库根目录的 `docs/contract/api.md`，Java 版运行同一份断言。
