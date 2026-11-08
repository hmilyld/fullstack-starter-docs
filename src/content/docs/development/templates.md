---
title: 模板约定
description: 维护 templates/ 目录时需要遵守的组织与命名约定。
---

脚手架的核心是 `templates/` 目录：其中的文件就是用户最终拿到的文件。修改模板等同于修改生成出来的项目。

## 各栈保持自身惯例

不同技术栈的目录组织**刻意不做统一**，而是各自遵循该语言的社区惯例：

| 模板 | 组织方式 |
| --- | --- |
| `backend-python/` | 领域模块化：`app/core/`（基础设施）+ 每个业务域一个包（`auth/`、`user/`、`role/`、`permission/`、`menu/` …），包内含 `models.py` / `schemas.py` / `service.py` / `router.py`；结构变更走 `migrations/`（Alembic） |
| `backend-java/` | 按层：`controller/`、`service/`、`repository/`、`entity/`、`dto/`，另有 `common/`、`config/`、`security/`；结构变更走 `db/migration/`（Flyway） |
| `frontend-react/` 与 `frontend-vue/` | 按功能：页面在 `pages/settings/<Domain>/`，接口按域拆分在 `api/`，类型按域拆分在 `types/` |

## 契约优先

`docs/contract/api.md` 是两个后端共同遵守的接口契约，由两套可执行测试固化：

- Python：`templates/backend-python/tests/test_contract.py`
- Java：`templates/backend-java/src/test/java/com/hmilyld/fullstack/ContractTest.java`

改接口时先改契约，再同时改两栈实现与两侧测试。任何一端单独漂移都会让测试失败。

## 后端实现约定

两栈结构刻意不统一，但质量标尺一致：

| 约定 | Python | Java |
| --- | --- | --- |
| 失败表达 | 抛领域异常（`AppException` 子类） | 抛领域异常（`AppException` 子类） |
| 事务 | `get_db` 正常返回提交，异常回滚 | `@Transactional` 遇异常回滚 |
| 响应类型 | Pydantic schema + `model_dump()` | `dto/*Response` 记录 |
| 分页越界 | 钳制 | 钳制 |
| 结构变更 | Alembic 迁移 | Flyway 迁移 |
| 角色名判定 | 仅 `admin` 全权 + 管理员账号保护，各一处 | 同左 |

## 命名与文案

- 前端与后端 UI 文案统一使用**中文**。
- 接口响应固定为 `{ code: 0, message: "success", data }`，错误使用 `code: -1`。
- TS/JS 变量用 `camelCase`，组件用 `PascalCase`。
- Python 的 Pydantic schema 字段用 `camelCase`（如 `roleId`），ORM 字段用 `snake_case`（如 `role_id`）。

## 共享基础设施

- Python 的 `ApiResponse` / `PaginatedData` 位于 `app/core/schemas.py`。
- 权限码目录是唯一来源：Python `app/core/permissions_catalog.py`，Java `config/PermissionCatalog.java`。
- 菜单展示与鉴权分离：`permissions` 只负责授权，`menu_groups` / `menu_items` 负责分组、路由、图标、顺序与显示状态（`hidden`）。
- 菜单权限必须通过「菜单与权限」页创建；内置菜单不可删除，自定义菜单删除时会级联清理其操作权限与角色授权。
- 数据导出包使用 `manifest.json + schema.sql + checksums.sha256 + data/*.jsonl`，只支持同后端、同版本恢复；`app_state` 不入包。
- 前端 HTTP 层是轻量的 fetch 封装（`api/client.ts`，基础设施在 `api/http.ts`），**不要引入 axios**。
- fetch 封装需要显式支持二进制下载、`FormData` 上传和自定义状态头，不能把所有响应都按 JSON 固定解析。
- 接口文档地址两栈一致：`/docs`（Swagger UI）与 `/openapi.json`（OpenAPI 描述）。Python 由 FastAPI 内置，Java 由 SpringDoc 提供。

## 相关页面

- [新增模板](/development/adding-templates/)
- [测试验证](/development/testing/)
