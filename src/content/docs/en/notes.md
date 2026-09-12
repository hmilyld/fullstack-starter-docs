---
title: Notes and FAQ
description: Pre-production deployment checklist, common pitfalls, and frequently asked questions.
---

The generated project is ready for development as-is, but there are a few things you must handle before going live. This page collects the key notes and common questions.

## Production Checklist

- [ ] **Change the default password**: `admin` still uses `123456`, which must be changed immediately.
- [ ] **Set a strong, random `JWT_SECRET_KEY`** (Python backend). Do not use the default or a weak value.
- [ ] **Do not commit `backend/.env` to version control**: `.gitignore` already excludes `.env`; keep it that way.
- [ ] **Delete or disable the sample users** (`zhangsan`, `lisi`, `wangwu`, `zhaoliu`).
- [ ] **Tighten CORS**: keep only the real frontend origin in `CORS_ORIGINS` / `app.cors-origins`.
- [ ] **Enable HTTPS**: add a TLS-terminating layer or reverse proxy in front of Nginx.
- [ ] **Plan for backups**: SQLite is a single-file database; back up the data volume or file regularly.

## Security Notes

### Weak keys refuse to start

The Python backend validates `JWT_SECRET_KEY` at startup: if it is empty or belongs to the weak-value set (`secret`, `123456`, `changeme`, `your-secret-key`, etc.), the process immediately errors and exits; a length under 32 triggers a warning.

```bash
openssl rand -base64 48
```

:::danger[Changing the key forces all users to log in again]
After you change `JWT_SECRET_KEY`, every already-issued JWT immediately becomes invalid. Do this during a maintenance window.
:::

### The local development key is temporary

If no key is configured, `dev.sh` generates a new random key on every start, so **sessions from before a restart become invalid** and users must log in again. This is a local-development-only phenomenon.

### Rate limiting is per-instance, in-memory state

Login/registration rate limiting (5 per IP per minute) is held in process memory. When you run multiple instances, each counts independently; if you need a global limit, implement it at the gateway layer.

### SSRF protection

The AI model connection test refuses to access localhost, intranet, and cloud metadata addresses by default, so it cannot be used as an entry point for intranet probing. Do not remove this validation.

### Audit logs contain sensitive information

Audit logs record the operator, IP, and details. This is compliance data, so restrict access to it and plan a retention period.

## Common Pitfalls

| Symptom | Cause and handling |
| --- | --- |
| Login required again after a restart | `JWT_SECRET_KEY` is not pinned locally; see above |
| Token invalid after switching backends | Python's JWT and Java's Sa-Token tokens are not interchangeable |
| Cannot log in after registering | Manual review is enabled; the account is in `pending_review` and needs an administrator to assign a role |
| Non-admin login rejected | Maintenance mode is enabled; an administrator can still log in to turn it off |
| Cannot save the SMTP password | Values containing `*` are rejected (to prevent overwriting the mask); submit an empty string to clear it |
| Data disappears after `docker compose down -v` | That command deletes the data volume; this is expected behavior |
| Dashboard revenue/activity are fixed values | Some dashboard fields are sample data; see [Dashboard](/en/features/dashboard/) |
| Creating a user with a non-default role fails | You additionally need the `users.assign_role` permission |
| Permission code changes do not take effect | Restart the backend to trigger a sync, or call `POST /api/permissions/sync` |

## FAQ

**How do I change the default role after registration?**
The current registration logic decides between `user` or `pending_review` based on the manual-review switch; `defaultRoleId` is kept as configuration but does not yet participate in that logic. To change a role, use user management or adjust the backend registration logic.

**Why is there no Swagger in the Java version?**
The Java template does not integrate OpenAPI documentation; the annotations under `controller/` are the source of truth for the API. The Python version is available at `http://localhost:8088/docs`.

**Why doesn't the frontend use axios?**
The convention is to use a native `fetch` wrapper (`api/client.ts`) for consistent handling of 401s and the response structure. The Vue template's `package.json` still lists `axios`, but the code does not use it and it can be safely removed.

**Can a phone access the admin panel?**
The admin UI is designed for computers and tablets; accessing it from a phone shows a "Please switch devices" (请更换设备) prompt, which is the template's expected behavior.

**Where is the data stored?**
During development it is a SQLite file in the backend directory; in Docker it lives at `/app/data` in the container, persisted by the named volume `app-data`.

## Related Pages

- [Authentication and Accounts](/en/features/authentication/)
- [Docker Deployment](/en/deployment/docker/)
- [Configuration and Environment Variables](/en/deployment/configuration/)
