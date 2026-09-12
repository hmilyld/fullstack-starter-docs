---
title: Dashboard
description: Which dashboard statistics are real and which are sample data.
---

The dashboard provides stat cards and recent activity, with the following endpoints:

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/dashboard/stats` | Stat cards | Yes (`dashboard`) |
| GET | `/api/dashboard/activity` | Recent activity | Yes (`dashboard`) |

## Data Notes

:::caution[Some data are sample values]
To showcase the interface, the template uses **fixed sample data** for some stat fields. Replace them before connecting real business logic:

| Field | Real? |
| --- | --- |
| `totalUsers` | Real; counts the total number of users |
| `activeNow` | Sample value |
| `revenue` | Sample value |
| `growth` | Sample value |
| Recent activity list | Entirely sample data |
:::

To connect real data, modify the backend `dashboard` module (Python `app/dashboard/router.py`, Java `service/DashboardService.java`); the frontend does not need any field structure changes.

## Frontend Pages

The dashboard page is located at:

- React: `src/pages/dashboard/index.tsx`
- Vue: `src/pages/dashboard/Index.vue`

To add more stat cards, reuse the existing card components and type definitions (`types/dashboard.ts`).
