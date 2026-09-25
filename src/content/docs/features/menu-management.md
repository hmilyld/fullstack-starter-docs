---
title: 菜单管理
description: 动态侧边栏的数据模型、分组与排序方式、内置菜单约束及管理接口。
---

菜单管理负责侧边栏的**展示结构**，权限系统负责**能否访问**。两者分离后，可以独立调整分组、顺序、路由和图标，而不会改变接口鉴权规则。

## 数据模型

| 表 | 作用 |
| --- | --- |
| `menu_groups` | 菜单分组、分组名称、全局顺序和内置标记 |
| `menu_items` | 菜单对应的权限码、分组、路由、图标和组内顺序 |
| `permissions` | 权限码、名称、类型和操作权限归属，仍是鉴权唯一依据 |

每个菜单项必须关联一个 `type=menu` 的权限码。用户没有该权限时，菜单不会出现在动态侧边栏中。

## 结构与排序

- 菜单固定为“分组 → 菜单项”两层，不支持下钻子菜单。
- 分组和菜单项都支持拖拽排序。
- 菜单项支持跨分组移动。
- 调整完成后点击保存，前端一次性提交完整布局。
- 后端使用 `menu_layout_version` 做乐观锁；其他管理员已保存新顺序时，当前草稿会提示刷新。

内置分组和内置菜单会被标记为 `is_system`：

- 内置菜单不可删除。
- 内置分组不可删除。
- 内置项仍可调整分组和顺序。
- 自定义分组只有为空时才能删除。
- 自定义菜单删除时，对应菜单权限和角色授权会同步清理。

## 动态侧边栏

前端不再硬编码菜单列表，而是登录后调用：

| 方法 | 路径 | 说明 | 认证 |
| --- | --- | --- | --- |
| GET | `/api/menus/navigation` | 返回当前用户可见的分组与菜单 | 登录 |

后端会先过滤用户权限，再按全局顺序返回结果。分组内没有可见菜单时，该分组不会返回。

## 管理接口

| 方法 | 路径 | 说明 | 权限 |
| --- | --- | --- | --- |
| GET | `/api/menus` | 读取完整配置和布局版本 | `menus` |
| POST | `/api/menus/groups` | 创建自定义分组 | `menus.create` |
| PUT | `/api/menus/groups/:id` | 重命名分组 | `menus.edit` |
| DELETE | `/api/menus/groups/:id` | 删除空的自定义分组 | `menus.delete` |
| POST | `/api/menus/items` | 创建自定义菜单及对应权限 | `menus.create` |
| PUT | `/api/menus/items/:code` | 编辑菜单元数据 | `menus.edit` |
| DELETE | `/api/menus/items/:code` | 删除自定义菜单及授权 | `menus.delete` |
| PUT | `/api/menus/layout` | 原子保存分组与菜单顺序 | `menus.reorder` |

## 新增业务页面

菜单路由允许管理员自由填写，但页面组件仍需由代码实现：

1. 在 `pages/settings/<Domain>/` 实现页面。
2. 在前端路由中注册对应路径。
3. 在菜单管理中创建菜单和权限码，或等待内置目录同步。
4. 为角色授予该菜单权限。

如果只创建菜单但未注册前端路由，点击后会进入 404。生产环境应把页面实现、路由、菜单和角色授权作为同一次发布内容。

## 前端页面

- React：`src/pages/settings/menu/index.tsx`
- Vue：`src/pages/settings/MenuManage/index.vue`

图标由后端保存稳定的图标名称，前端在受限的图标映射表中渲染，避免后端数据直接控制组件加载。

## 相关页面

- [权限系统](/features/rbac/)
- [权限码](/reference/permissions/)
- [前端结构](/generated/frontend/)
- [API 接口](/reference/api/)
