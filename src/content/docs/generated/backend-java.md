---
title: Java 后端
description: Spring Boot 模板的分层结构、数据库迁移、认证与配置。
---

Java 后端使用 Spring Boot 3.2 + Spring Data JPA + SQLite，代码按**层**组织。

## 分层结构

```
src/main/java/com/hmilyld/fullstack/
├── FullstackApplication.java
├── common/            # ApiResponse、PageResult、全局异常处理
├── config/            # 审计、CORS、Sa-Token、权限目录与同步任务
├── controller/        # 9 个控制器：auth / user / role / permission / system ...
├── service/           # 业务逻辑
├── repository/        # Spring Data JPA 仓储
├── entity/            # JPA 实体
├── dto/               # 请求 / 响应对象
└── security/          # RateLimiter、StpInterfaceImpl
```

## 数据库与迁移

- 数据库为 SQLite 文件，默认 `./data/app.db`。
- 使用 **Flyway** 管理结构：`src/main/resources/db/migration/V1__init.sql` 建表并写入种子数据。
- JPA 设为 `ddl-auto: none`，结构完全由迁移脚本控制。
- 启动后 `PermissionSyncRunner` 会同步权限目录并补齐 `admin` 角色权限。

## 认证：Sa-Token

Java 版使用 **Sa-Token** 的服务端会话令牌（UUID 风格），**不需要 `JWT_SECRET_KEY`**。

- 令牌默认有效期 86400 秒（24 小时）。
- `BearerTokenFilter` 将 `Authorization: Bearer <token>` 转换为 Sa-Token 需要的 `satoken` 头。
- 接口权限通过 `@SaCheckPermission(...)` 注解声明，支持 `SaMode.OR` 组合多个权限码。
- `BCrypt` 用于密码哈希。

:::caution[与 Python 版令牌不通用]
Sa-Token 的 UUID 令牌与 Python 版的 JWT 格式不同，切换后端时前端必须重新登录。
:::

## 配置

配置文件位于 `src/main/resources/application.yml`：

| 配置 | 默认值 | 说明 |
| --- | --- | --- |
| `server.port` | `8088` | 后端端口 |
| `spring.datasource.url` | `jdbc:sqlite:./data/app.db` | SQLite 文件路径 |
| `spring.jpa.hibernate.ddl-auto` | `none` | 结构由 Flyway 管理 |
| `spring.flyway.enabled` | `true` | 启用迁移 |
| `sa-token.token-style` | `uuid` | 令牌风格 |
| `sa-token.timeout` | `86400` | 令牌有效期（秒） |
| `app.cors-origins` | `http://localhost:5173` | 允许的前端来源 |
| `app.audit.exclude-paths` | `/api/auth` | 审计中间件排除路径 |

## 手动启动

```bash
cd backend
mvn spring-boot:run
```

后端监听 `http://localhost:8088`。与 Python 版不同，Java 版不提供内置 Swagger 文档，接口定义以 `controller/` 下的代码为准。

## 代码检查

构建脚本使用 Spotless 校验格式：

```bash
cd backend && mvn spotless:check
```
