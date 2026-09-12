---
title: 默认账号
description: 生成项目预置的管理员与普通用户账号。
---

生成的项目在首次启动时写入以下账号，密码均为 `123456`。

| 用户名 | 姓名 | 邮箱 | 角色 |
| --- | --- | --- | --- |
| `admin` | 管理员 | admin@example.com | `admin` |
| `zhangsan` | 张三 | zhangsan@example.com | `user` |
| `lisi` | 李四 | lisi@example.com | `user` |
| `wangwu` | 王五 | wangwu@example.com | `user` |
| `zhaoliu` | 赵六 | zhaoliu@example.com | `user` |

`admin` 是唯一的管理员账号，拥有全部权限。其余四个为普通用户，仅有 `dashboard`、`users`、`settings` 三个菜单的查看权限。

:::danger[生产环境必须处理默认账号]
- 默认密码 `123456` 仅用于开发调试，部署后请立即修改管理员密码。
- 建议删除或禁用不需要的示例用户。
- 种子数据是幂等的：数据库中已有用户或权限时不会重复写入，因此修改密码后重启不会被重置。
:::

新注册账号根据系统设置进入 `user` 或 `pending_review` 角色，详见[认证与账号](/features/authentication/)。

## 相关页面

- [快速开始](/getting-started/quickstart/)
- [权限系统](/features/rbac/)
