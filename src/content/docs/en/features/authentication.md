---
title: Authentication and Accounts
description: Login, registration, logout, rate limiting, maintenance mode, and manual review.
---

Authentication is provided uniformly by the backend, and the frontend carries the token via `Authorization: Bearer <token>`.

## Endpoints

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | Log in | No |
| POST | `/api/auth/register` | Register | No |
| POST | `/api/auth/logout` | Log out | Python: yes; Java: tolerates unauthenticated calls |

## Login

On success, the backend returns a token and user information (including permission codes and roles); the frontend stores the token and enters the admin panel. On failure, it returns a Chinese error message and records an audit log.

## Registration

Registration behavior is controlled by two system settings:

- When **open registration** (`openRegistration`) is `false`, the registration endpoint returns "Registration is closed" (注册已关闭).
- When **manual review** (`manualReview`) is `true`, new accounts are assigned the `pending_review` role, and the endpoint returns only "Registration successful, please wait for administrator approval" (注册成功，请等待管理员审核), **without issuing a token**; when `false`, the account is directly assigned the `user` role and logged in automatically.

:::note
An account in `pending_review` cannot log in and is shown "The account is under review, please wait for administrator approval" (账号正在审核中，请等待管理员批准). An administrator can assign a role in user management to complete the review.
:::

## Rate Limiting

Login and registration are limited by **IP**: **at most 5 times per minute**. Exceeding this returns:

- Login: "Too many login attempts, please try again later" (登录尝试过于频繁，请稍后再试)
- Registration: "Too many registration attempts, please try again later" (注册尝试过于频繁，请稍后再试)

The limit is enforced before credential validation. IP resolution order is `X-Real-IP` (set by Nginx, cannot be forged) → first entry of `X-Forwarded-For` → direct connection address.

## Maintenance Mode

Administrators can enable maintenance mode in system settings. Once enabled:

- **Non-admin** logins are rejected and return the custom maintenance message ("System under maintenance" (系统维护中) if none is configured).
- **Administrators** can still log in normally so they can turn maintenance mode off.

## Tokens and Logout

| | Python | Java |
| --- | --- | --- |
| Token type | JWT (PyJWT, HS256) | Sa-Token UUID session token |
| Validity | 24 hours by default | 86400 seconds by default |
| Logout | Requires login; deletes the server-side session | Tolerates unauthenticated calls and also returns success |

:::caution[Tokens are not interchangeable]
The two stacks use different token formats and cannot be swapped. Changing `JWT_SECRET_KEY` immediately invalidates every already-issued Python token.
:::

## Frontend Behavior

On receiving **401**, the frontend request layer automatically clears the local login state and redirects to the login page; there is no need to handle this separately on each page.

## Related Pages

- [Default Accounts](/en/reference/default-accounts/)
- [Permission System](/en/features/rbac/)
- [System Settings](/en/features/system-settings/)
