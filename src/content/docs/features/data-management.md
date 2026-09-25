---
title: 数据管理
description: 完整数据的加密导出、事务导入、系统冻结和会话失效机制。
---

数据管理提供当前 SQLite 系统的完整**导出**与**导入**，不维护服务端历史备份列表。

## 适用范围

- 只支持同后端实现、同应用版本、同数据库结构恢复。
- Python 导出的文件只能导入 Python；Java 同理。
- 导出包含全部业务表，包括用户密码哈希、系统配置、AI API Key、SMTP 密码和审计日志。
- 运行时 `app_state` 不进入导出包，避免恢复旧的会话世代和布局锁版本。

## 压缩包结构

```text
manifest.json
schema.sql
checksums.sha256
data/menu_groups.jsonl
data/permissions.jsonl
data/menu_items.jsonl
data/roles.jsonl
data/role_permissions.jsonl
data/users.jsonl
data/system_config.jsonl
data/ai_models.jsonl
data/ai_model_presets.jsonl
data/audit_logs.jsonl
```

`manifest.json` 记录格式版本、应用版本、数据结构版本、后端类型、表清单、字段、行数和校验值。`schema.sql` 用于阅读和审计，导入时不会直接执行。

## 导出流程

1. 后端获取一致的 SQLite 快照。
2. 按表流式输出 JSONL，并生成 SHA-256 校验值。
3. 使用安全随机数生成一次性密码。
4. 以 AES-256 加密 ZIP。
5. 浏览器下载文件后显示密码。

密码不会写入数据库、日志或浏览器存储，关闭提示框后无法再次查看。遗失密码只能重新导出。

## 导入流程

1. 验证权限并上传 ZIP。
2. 校验密码、文件结构、版本、表清单、字段、行数、校验值和压缩炸弹限制。
3. 创建一次性 `jobToken` 并返回 `202`。
4. 除导入状态接口外，所有普通请求返回 `503`。
5. 在单个数据库事务中清空业务表并按依赖顺序恢复。
6. 校验导入包中至少存在一个有效管理员账号。
7. 更新 `app_state.session_epoch` 后提交。
8. 解除冻结，所有已有登录会话立即失效。

导入失败会回滚事务并解除冻结，不会轮换会话世代。成功后必须重新登录。

## 导入状态

数据库加载完成后旧登录令牌已经失效，因此状态查询不使用普通登录认证，而是依赖创建任务时返回的一次性令牌：

| 方法 | 路径 | 说明 | 认证 |
| --- | --- | --- | --- |
| POST | `/api/data/export` | 下载加密完整导出包 | `data_management.export` |
| POST | `/api/data/import` | 上传并创建导入任务 | `data_management.import` |
| GET | `/api/data/import/:id` | 查询任务状态 | `X-Import-Job-Token` |

## 大文件与存储

- 导出和导入都使用流式文件处理与批量写入，避免把整个数据库载入内存。
- 默认上传上限为 1 GB，解压后总大小另有上限。
- 临时快照、上传文件和导出包位于数据目录的 `tmp` 子目录。
- 建议为数据卷预留至少约为数据库体积 3 倍的可用空间。
- 生成项目的 Nginx 配置已关闭代理缓冲，并放宽大文件上传和超时设置。

## 安全边界

导出包包含敏感凭据，应视为高敏感文件保管，不要通过聊天、邮件或公共存储分发。当前方案没有服务端备份历史，也没有跨版本迁移或跨后端转换能力。

## 前端页面

- React：`src/pages/settings/data-management/index.tsx`
- Vue：`src/pages/settings/DataManagement/index.vue`

## 相关页面

- [权限码](/reference/permissions/)
- [API 接口](/reference/api/)
- [Docker 部署](/deployment/docker/)
- [注意事项](/notes/)
