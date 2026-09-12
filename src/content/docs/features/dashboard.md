---
title: 仪表盘
description: 仪表盘统计的哪些数据是真实的，哪些是示例数据。
---

仪表盘提供统计卡片与近期活动，接口如下：

| 方法 | 路径 | 说明 | 认证 |
| --- | --- | --- | --- |
| GET | `/api/dashboard/stats` | 统计卡片 | 是（`dashboard`） |
| GET | `/api/dashboard/activity` | 近期活动 | 是（`dashboard`） |

## 数据说明

:::caution[部分数据为示例值]
模板为了展示界面效果，部分统计字段是**固定示例数据**，接入真实业务前请替换：

| 字段 | 是否真实 |
| --- | --- |
| `totalUsers` | 真实，统计用户总数 |
| `activeNow` | 示例值 |
| `revenue` | 示例值 |
| `growth` | 示例值 |
| 近期活动列表 | 全部为示例数据 |
:::

接入真实数据时，修改后端 `dashboard` 模块（Python `app/dashboard/router.py`，Java `service/DashboardService.java`）即可，前端无需改动字段结构。

## 前端页面

仪表盘页面位于：

- React：`src/pages/dashboard/index.tsx`
- Vue：`src/pages/dashboard/Index.vue`

如需新增统计卡片，沿用现有的卡片组件与类型定义（`types/dashboard.ts`）即可。
