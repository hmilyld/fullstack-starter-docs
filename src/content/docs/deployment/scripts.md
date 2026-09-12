---
title: 开发与构建脚本
description: dev.sh 与 build.sh 的行为、子命令与依赖假设。
---

生成的项目根目录包含两个脚本：`dev.sh` 用于开发，`build.sh` 用于构建与检查。

## dev.sh

```bash
./dev.sh start      # 默认，安装依赖并启动前后端
./dev.sh stop       # 停止服务
./dev.sh restart    # 重启
./dev.sh install    # 只安装依赖
```

`start` 会：

1. 运行 `install`：前端 `npm install`；Python 后端 `uv sync`；Java 后端依赖由 Maven 自动管理。
2. 启动后端：
   - Python：`uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8088`
   - Java：`mvn spring-boot:run`
3. 启动前端：`npm run dev`（端口 5173）。
4. 打印访问地址，并等待（`wait`）。

脚本通过 `trap cleanup EXIT INT TERM` 在退出时同时结束后端与前端进程。

### 自动生成 JWT 密钥

当你选择 Python 后端，且环境变量 `JWT_SECRET_KEY` 与 `backend/.env` 都未设置时，`dev.sh` 会：

```bash
export JWT_SECRET_KEY="$(openssl rand -base64 48)"
```

并提示「未设置 JWT_SECRET_KEY，已为本地开发自动生成随机密钥（重启后登录会失效）」。

:::caution[需要 openssl]
自动生成密钥依赖 `openssl`。若本机没有该命令，请手动设置 `JWT_SECRET_KEY`，否则后端会因安全校验拒绝启动。
:::

## build.sh

```bash
./build.sh
```

依次执行：

1. 前端构建：`cd frontend && npm run build`
2. 后端检查：
   - Python：`uv run ruff check .`
   - Java：`mvn spotless:check`

任一环节失败，脚本因 `set -e` 立即退出。

## 相关页面

- [安装与环境](/getting-started/installation/)
- [配置与环境变量](/deployment/configuration/)
- [Docker 部署](/deployment/docker/)
