---
title: 模板约定
description: 维护 templates/ 目录时需要遵守的组织与命名约定。
---

脚手架的核心是 `templates/` 目录：其中的文件就是用户最终拿到的文件。修改模板等同于修改生成出来的项目。

## 各栈保持自身惯例

不同技术栈的目录组织**刻意不做统一**，而是各自遵循该语言的社区惯例：

| 模板 | 组织方式 |
| --- | --- |
| `backend-python/` | 领域模块化：`app/core/`（基础设施）+ 每个业务域一个包（`auth/`、`user/`、`role/` …），包内含 `models.py` / `schemas.py` / `crud.py` / `router.py` |
| `backend-java/` | 按层：`controller/`、`service/`、`repository/`、`entity/`、`dto/`，另有 `common/`、`config/`、`security/` |
| `frontend-react/` 与 `frontend-vue/` | 按功能：页面在 `pages/settings/<Domain>/`，接口按域拆分在 `api/`，类型按域拆分在 `types/` |

## 命名与文案

- 前端与后端 UI 文案统一使用**中文**。
- 接口响应固定为 `{ code: 0, message: "success", data }`，错误使用 `code: -1`。
- TS/JS 变量用 `camelCase`，组件用 `PascalCase`。
- Python 的 Pydantic schema 字段用 `camelCase`（如 `roleId`），ORM 字段用 `snake_case`（如 `role_id`）。

## 共享基础设施

- Python 的 `ApiResponse` / `PaginatedData` 位于 `app/core/schemas.py`。
- 权限码目录是唯一来源：Python `app/core/permissions_catalog.py`，Java `config/PermissionCatalog.java`。
- 前端 HTTP 层是轻量的 fetch 封装（`api/client.ts`），**不要引入 axios**。

## 相关页面

- [新增模板](/development/adding-templates/)
- [测试验证](/development/testing/)
