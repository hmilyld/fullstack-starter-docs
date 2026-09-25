---
title: Data Management
description: Encrypted full-data export, transactional import, system freeze, and session invalidation.
---

Data management provides complete **export** and **import** for the current SQLite system. It does not maintain a server-side history of backups.

## Scope

- Restore is supported only for the same backend implementation, application version, and database schema.
- A file exported by Python can only be imported by Python, and the same applies to Java.
- Exports include every business table, including password hashes, system configuration, AI API keys, SMTP passwords, and audit logs.
- Runtime `app_state` is excluded so old session epochs and layout-lock versions are not restored.

## Archive Layout

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

`manifest.json` records the format version, application version, schema version, backend type, tables, columns, row counts, and checksums. `schema.sql` is for inspection and audit; import does not execute it directly.

## Export Flow

1. The backend obtains a consistent SQLite snapshot.
2. Tables are streamed as JSONL and SHA-256 checksums are generated.
3. A cryptographically secure random one-time password is generated.
4. The archive is encrypted with AES-256.
5. The browser downloads the file and displays the password.

The password is never written to the database, logs, or browser storage. It cannot be displayed again after the dialog closes. If it is lost, generate a new export.

## Import Flow

1. Verify permission and upload the ZIP.
2. Validate password, structure, versions, tables, columns, row counts, checksums, and decompression limits.
3. Create a one-time `jobToken` and return `202`.
4. Every ordinary request returns `503` except the import status endpoint.
5. Restore all business tables in dependency order inside one database transaction.
6. Require at least one valid administrator account in the archive.
7. Rotate `app_state.session_epoch` and commit.
8. Release the freeze; every existing login session is now invalid.

Failure rolls back the transaction and releases the freeze without rotating the session epoch. Success requires everyone to log in again.

## Import Status

Old login tokens are invalid once the database commit completes, so status polling uses the one-time token returned when the job was created:

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/data/export` | Download an encrypted full export | `data_management.export` |
| POST | `/api/data/import` | Upload and create an import job | `data_management.import` |
| GET | `/api/data/import/:id` | Query job status | `X-Import-Job-Token` |

## Large Files and Storage

- Export and import use streaming file processing and batch writes rather than loading the full database into memory.
- The default upload limit is 1 GB, with a separate total-uncompressed limit.
- Temporary snapshots, uploads, and archives live under the data directory's `tmp` subdirectory.
- Reserve at least roughly three times the database size in the data volume.
- The generated Nginx configuration disables proxy buffering and relaxes large-file upload and timeout settings.

## Security Boundary

The archive contains sensitive credentials and must be protected as a high-sensitivity file. Do not distribute it through chat, email, or public storage. The current design has no server-side backup history, cross-version migration, or cross-backend conversion.

## Frontend Pages

- React: `src/pages/settings/data-management/index.tsx`
- Vue: `src/pages/settings/DataManagement/index.vue`

## Related Pages

- [Permission Codes](/en/reference/permissions/)
- [API Reference](/en/reference/api/)
- [Docker Deployment](/en/deployment/docker/)
- [Notes and FAQ](/en/notes/)
