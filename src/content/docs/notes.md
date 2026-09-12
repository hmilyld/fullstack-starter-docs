---
title: 注意事项与 FAQ
description: 生产部署前的 checklist、常见坑与常见问题。
---

生成的项目可以直接开发，但上线前有几件事必须处理。本页汇总关键注意事项与常见问题。

## 生产检查清单

- [ ] **修改默认密码**：`admin` 仍使用 `123456`，必须立即修改。
- [ ] **设置强随机 `JWT_SECRET_KEY`**（Python 后端），不要使用默认值或弱值。
- [ ] **不要把 `backend/.env` 提交到版本库**：`.gitignore` 已排除 `.env`，请保持。
- [ ] **删除或禁用示例用户**（`zhangsan`、`lisi`、`wangwu`、`zhaoliu`）。
- [ ] **收紧 CORS**：`CORS_ORIGINS` / `app.cors-origins` 只保留真实前端域名。
- [ ] **启用 HTTPS**：在 Nginx 前再加一层 TLS 终止或使用反向代理。
- [ ] **规划数据备份**：SQLite 为单文件数据库，定期备份数据卷或文件。

## 安全须知

### 弱密钥会拒绝启动

Python 后端启动时校验 `JWT_SECRET_KEY`：为空或属于弱值集合（`secret`、`123456`、`changeme`、`your-secret-key` 等）会直接报错退出；长度不足 32 会警告。

```bash
openssl rand -base64 48
```

:::danger[密钥变更会强制所有用户重新登录]
修改 `JWT_SECRET_KEY` 后，所有已签发的 JWT 立即失效。请在维护窗口内操作。
:::

### 本地开发密钥是临时的

若未配置密钥，`dev.sh` 每次启动都会生成新的随机密钥，因此**重启后之前登录的会话会失效**，需要重新登录。这只是本地开发现象。

### 速率限制是单实例内存态

登录/注册的速率限制（每分钟 5 次/IP）保存在进程内存中。多实例部署时各实例独立计数，如需全局限制应在网关层实现。

### SSRF 防护

AI 模型连接测试默认拒绝访问本机、内网与云元数据地址，避免被用作内网探测入口。请勿移除该校验。

### 审计日志含敏感信息

审计日志记录操作人、IP 与详情，属于合规数据，请控制访问权限并规划保留周期。

## 常见坑

| 现象 | 原因与处理 |
| --- | --- |
| 重启后需要重新登录 | 本地未固定 `JWT_SECRET_KEY`，见上文 |
| 换后端后令牌失效 | Python 的 JWT 与 Java 的 Sa-Token 令牌不通用 |
| 注册后无法登录 | 开启了人工审核，账号处于 `pending_review`，需管理员分配角色 |
| 非管理员登录被拒 | 开启了维护模式，管理员仍可登录以关闭它 |
| 无法保存 SMTP 密码 | 含 `*` 的值会被拒绝（防掩码覆盖），清空请提交空字符串 |
| 使用 `docker compose down -v` 后数据消失 | 该命令会删除数据卷，属预期行为 |
| 仪表盘收入/活跃是固定值 | 仪表盘部分字段为示例数据，详见[仪表盘](/features/dashboard/) |
| 创建非默认角色用户失败 | 需要额外拥有 `users.assign_role` 权限 |
| 修改权限码后未生效 | 重启后端触发同步，或调用 `POST /api/permissions/sync` |

## FAQ

**如何修改注册后的默认角色？**
当前注册逻辑按人工审核开关决定为 `user` 或 `pending_review`，`defaultRoleId` 作为配置保留但暂未参与该逻辑。修改角色请通过用户管理，或在后端注册逻辑中调整。

**Java 版为什么没有 Swagger？**
Java 模板未集成 OpenAPI 文档，接口以 `controller/` 下的注解为准。Python 版访问 `http://localhost:8088/docs` 即可。

**前端为什么不用 axios？**
约定使用原生 `fetch` 封装（`api/client.ts`），便于统一处理 401 与响应结构。Vue 模板的 `package.json` 中仍列出了 `axios`，但代码未使用，可以安全移除。

**手机能访问后台吗？**
后台界面面向电脑与平板设计，手机访问会显示「请更换设备」的提示，这是模板的预期行为。

**数据存在哪里？**
开发时是后端目录下的 SQLite 文件；Docker 中位于容器的 `/app/data`，由命名卷 `app-data` 持久化。

## 相关页面

- [认证与账号](/features/authentication/)
- [Docker 部署](/deployment/docker/)
- [配置与环境变量](/deployment/configuration/)
