---
title: Java 后端
description: Spring Boot 模板的分层结构、数据库迁移、认证、接口文档与配置。
---

Java 后端使用 Spring Boot 3.2 + Spring Data JPA + SQLite，代码按**层**组织。

## 分层结构

```
src/main/java/com/hmilyld/fullstack/
├── FullstackApplication.java
├── common/            # ApiResponse、PageResult、领域异常、全局异常处理
├── config/            # 审计、CORS、Sa-Token、OpenAPI、目录同步、导入冻结
├── controller/        # 12 个控制器：auth / user / role / permission / menu / data ...
├── service/           # 业务逻辑（失败抛异常，事务因此可回滚）
├── repository/        # Spring Data JPA 仓储
├── entity/            # JPA 实体
├── dto/               # 请求对象与 *Response 响应记录
└── security/          # RateLimiter、StpInterfaceImpl
```

响应一律使用 `dto/*Response` 类型化记录，**不再返回 `Map<String, Object>`**。

## 数据库与迁移

- 数据库为 SQLite 文件，默认 `./data/app.db`。
- 使用 **Flyway** 管理结构：
  - `V1__init.sql`：建表与基础种子
  - `V2__menu_and_app_state.sql`：菜单与运行状态表
  - `V3__menu_hidden.sql`：菜单显示/隐藏
  - `V4__align_with_python.sql`：与 Python 侧对齐的索引与 `app_state` 行
- JPA 设为 `ddl-auto: none`，结构完全由迁移脚本控制。
- 启动后 `PermissionSyncRunner` 先同步权限，`MenuSyncRunner` 再补齐内置菜单，不覆盖管理员调整的顺序。

## 错误与事务

- 业务失败**抛领域异常**（`AppException`、`NotFoundException`、`ConflictException`、`InvalidOperationException`、`ForbiddenException`），由 `GlobalExceptionHandler` 统一映射。
- 因为失败通过异常表达，`@Transactional` 方法会正常回滚，**不会出现「先写库再返回 `error`」**。
- 响应信封的 `data` 键**始终存在**（失败时为 `null`）。这需要 `ApiResponse` 标注 `@JsonInclude(ALWAYS)`，并关闭全局的 `non_null` 过滤，否则 `data`、`parent` 等空值字段会从 JSON 中消失。

## 认证：Sa-Token

Java 版使用 **Sa-Token** 的服务端会话令牌（UUID 风格），**不需要 `JWT_SECRET_KEY`**。

- 令牌默认有效期 86400 秒（24 小时）。
- `BearerTokenFilter` 将 `Authorization: Bearer <token>` 转换为 Sa-Token 需要的 `satoken` 头。
- 登录时在 Sa-Token Session 中记录全局 `session_epoch`，每次请求都会与数据库状态校验；数据导入成功后所有会话失效。
- 登出、修改密码、管理员重置密码都会调用 `StpUtil.logout(userId)` 吊销该用户的全部会话。
- 接口权限通过 `@SaCheckPermission(...)` 注解声明，支持 `SaMode.OR` 组合多个权限码。
- `BCrypt` 用于密码哈希。
- SSRF 防护在解析域名后逐条判定，拒绝内网、回环、链路本地地址与云元数据端点。

:::caution[与 Python 版令牌不通用]
Sa-Token 的 UUID 令牌与 Python 版的 JWT 格式不同，切换后端时前端必须重新登录。
:::

## 接口文档：SpringDoc

Java 版集成 **SpringDoc OpenAPI 2.5.0**（Spring Boot 3.2.x 对应 2.3.x–2.5.x），路径刻意对齐 Python：

| 用途 | 地址 |
| --- | --- |
| Swagger UI | `http://localhost:8088/docs` |
| OpenAPI 描述 | `http://localhost:8088/openapi.json` |

`config/OpenApiConfig.java` 只声明全局标题、版本与 `bearerAuth` 方案，不逐端点写注解——方法、参数与 DTO 结构由 springdoc 反射生成。Swagger UI 的 **Authorize** 按钮填入登录返回的令牌即可调试需要鉴权的接口。

## 配置

配置文件位于 `src/main/resources/application.yml`：

| 配置 | 默认值 | 说明 |
| --- | --- | --- |
| `server.port` | `8088` | 后端端口 |
| `spring.datasource.url` | `jdbc:sqlite:./data/app.db` | SQLite 文件路径 |
| `spring.jpa.hibernate.ddl-auto` | `none` | 结构由 Flyway 管理 |
| `spring.flyway.enabled` | `true` | 启用迁移 |
| `spring.jackson.default-property-inclusion` | `always` | 空值字段照常输出（契约要求） |
| `sa-token.token-style` | `uuid` | 令牌风格 |
| `sa-token.timeout` | `86400` | 令牌有效期（秒） |
| `app.cors-origins` | `http://localhost:5173` | 允许的前端来源 |
| `app.rate-limit.max-attempts` | `5` | 登录/注册每分钟尝试上限 |
| `app.rate-limit.window-ms` | `60000` | 限流窗口（毫秒） |
| `app.audit.exclude-paths` | `/api/auth` | 审计中间件排除路径 |
| `app.data.tmp-dir` | `./data/tmp` | 导入导出临时目录 |
| `app.data.max-import-size-bytes` | `1073741824` | 导入包大小上限 |
| `springdoc.api-docs.path` | `/openapi.json` | OpenAPI 描述路径 |
| `springdoc.swagger-ui.path` | `/docs` | Swagger UI 路径 |
| `spring.servlet.multipart.max-file-size` | `1GB` | multipart 上传上限 |

## 手动启动

```bash
cd backend
mvn spring-boot:run
```

后端监听 `http://localhost:8088`，接口文档在 `http://localhost:8088/docs`。

## 代码检查与测试

```bash
cd backend
mvn spotless:apply      # 格式化（提交前必须执行）
mvn spotless:check      # 校验格式
mvn test                # 24 条契约测试
```

契约测试位于 `src/test/java/com/hmilyld/fullstack/ContractTest.java`，与 Python 版断言同一份 `docs/contract/api.md`。
