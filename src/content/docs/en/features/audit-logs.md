---
title: Audit Logs
description: Which operations audit logs record, their field structure, and how to filter them.
---

Audit logs track write operations and permission denials in the system for troubleshooting and compliance.

## Scope

The middleware (`AuditMiddleware` in Python, `AuditInterceptor` in Java) records requests under `/api/`:

- **Write methods**: `POST`, `PUT`, `DELETE`, `PATCH`, recorded with status `success`.
- **Any 403 response**: recorded with status `permission_denied`, regardless of request method.
- `/api/auth/*` is excluded by the middleware and recorded explicitly by business code instead, to avoid duplicates.

Authentication-related operations are written explicitly by business code:

| Action `action` | Trigger |
| --- | --- |
| `login` | Login success or failure (bad credentials, pending review, under maintenance) |
| `register` | Registration success or failure (registration closed, username/email already exists) |
| `logout` | Logout |

For ordinary write operations, the `action` takes the form `"POST /api/users"`, i.e. "method + path".

## Log Fields

| Field | Description |
| --- | --- |
| `userId` / `username` | Operator |
| `action` | Action or "method + path" |
| `ip` | Client IP |
| `status` | `success` or `permission_denied` |
| `detail` | Details |
| `createdAt` | Time |

`user_id`, `status`, and `created_at` are indexed.

## Client IP

IP resolution order:

1. `X-Real-IP` (set by Nginx, cannot be forged)
2. The first entry of `X-Forwarded-For`
3. The direct connection address

## Querying and Filtering

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/audit-logs` | Log list | Yes (`audit_logs`) |

Supported query parameters:

| Parameter | Description |
| --- | --- |
| `userId` | Filter by user |
| `status` | Filter by status |
| `action` | Fuzzy match by action |
| `startTime` / `endTime` | Filter by time range |
| `page` / `pageSize` | Pagination (`pageSize` capped at 100) |

Results are returned in descending `createdAt` order. If the username is missing from a log, it is filled in by joining the `users` table.

:::note
Audit write failures are silent and do not affect normal requests. The logs themselves are not automatically purged by any endpoint other than `/api/audit-logs`, so plan an archival strategy based on your data volume.
:::

## Related Pages

- [Permission System](/en/features/rbac/)
- [API Reference](/en/reference/api/)
