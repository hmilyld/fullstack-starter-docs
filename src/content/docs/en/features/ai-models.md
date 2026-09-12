---
title: AI Models and Presets
description: Model configuration, API Key masking, default models, preset groups, and connection tests.
---

The AI models module centrally manages the large-model configurations the backend calls, and provides a set of presets to choose from.

## Configuring a Model

| Field | Description |
| --- | --- |
| `alias` | Unique alias; only letters, digits, underscores, and hyphens are allowed (`^[a-zA-Z0-9_-]+$`) |
| `modelName` | Model name, e.g. `deepseek-v4-flash` |
| `apiUrl` | Endpoint URL |
| `apiKey` | Access key |
| `description` | Description |
| `isDefault` | Whether this is the default model |

Marking a model as default automatically clears the default flag on other models, so **there is always at most one default model**.

## API Key Masking

When model information is returned, the API key is masked:

- Length under 12: returns `****`.
- Otherwise returns a value shaped like `ab****yz`.

On update, the masked value is not written back to the database, so the real key is not overwritten.

## Query Endpoints

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/ai-models/default` | Default model (no key) | Login |
| GET | `/api/ai-models/by-alias/:alias` | Query by alias (no key) | Login |
| GET | `/api/ai-models` | List (`search`, pagination) | `ai_models` |
| POST | `/api/ai-models` | Create | `ai_models.create` |
| GET | `/api/ai-models/:id` | Details | `ai_models` |
| PUT | `/api/ai-models/:id` | Update | `ai_models.edit` |
| DELETE | `/api/ai-models/:id` | Delete | `ai_models.delete` |
| POST | `/api/ai-models/test` | Connection test | `ai_models` |

The public information returned by `default` and `by-alias` **does not include the API key**, so it is safe to use at runtime to fetch a model by alias.

## Presets

Presets are an optional list of models, divided into groups such as the built-in `DeepSeek` and `Xiaomi MiMo` (小米 MiMo):

| Group | Preset aliases | Default URL |
| --- | --- | --- |
| DeepSeek | `deepseek-v4-flash`, `deepseek-v4-pro` | `https://api.deepseek.com/v1/chat/completions` |
| Xiaomi MiMo (小米 MiMo) | `mimo-v2.5` | `https://api.xiaomi.com/v1/chat/completions` |

Preset fields include group, alias, model name, URL, description, whether active (`isActive`), and sort order. Once enabled, they can be displayed ordered by `sortOrder` for the frontend's model selector.

Preset create/update/delete accepts either family of permissions, `ai_models.*` or `ai_models.presets.*` (meeting either is enough).

- `GET /api/ai-models/presets` list (supports `search`, `group`)
- `GET /api/ai-models/presets/groups` groups
- `GET /api/ai-models/presets/active` active presets (login required)
- `POST` / `PUT` / `DELETE` create/update/delete

## Connection Test

`POST /api/ai-models/test` sends one minimal chat request to the target URL (`max_tokens: 10`, `temperature: 0`), with a 30-second timeout, and returns:

```json
{ "success": true, "message": "...", "responseTime": 820, "model": "deepseek-v4-flash" }
```

The request body can pass `modelId` to reuse an already-saved URL and key, or pass the three fields `apiUrl`, `apiKey`, and `modelName` directly.

:::danger[SSRF protection]
The connection test refuses to access non-`http(s)` addresses, `localhost`, `127.0.0.1`, `::1`, cloud metadata addresses (`169.254.169.254`, `metadata.google.internal`), and private/loopback/link-local IPs, so it cannot be used to probe the intranet.
:::

## Related Pages

- [Permission Codes](/en/reference/permissions/)
- [API Reference](/en/reference/api/)
