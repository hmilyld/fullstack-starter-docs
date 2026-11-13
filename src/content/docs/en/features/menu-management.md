---
title: Menu & Permissions
description: The dynamic sidebar data model, grouping, ordering, show/hide, operation permissions, built-in menu constraints, and management APIs.
---

The Menu & Permissions page owns the sidebar's **presentation structure**, while the permission system owns **whether access is allowed**. Keeping them separate lets you change groups, order, routes, icons, and visibility without changing API authorization rules.

## Data Model

| Table | Purpose |
| --- | --- |
| `menu_groups` | Menu groups, names, global order, and built-in flags |
| `menu_items` | Permission code, group, route, icon, item order, and sidebar visibility (`hidden`) |
| `permissions` | Permission code, name, type, and operation-permission parent; still the source of authorization |

Every menu item must reference a permission code whose type is `menu`. If a user does not hold that permission, the item is absent from the dynamic sidebar.

Operation permissions (`type=operation`) belong to a menu through `permissions.parent` and are maintained alongside the menu on the Menu & Permissions page.

## Structure and Ordering

- The page renders a three-level tree table: group → menu → operation permission. Operation permissions are separate rows and are not draggable.
- Groups and items can be reordered by dragging, and items can be moved between groups. **Dropping saves immediately.**
- Only one layout write runs at a time; other structural actions are disabled while a write is in flight.
- The backend uses `menu_layout_version` for optimistic locking. If another administrator saves first, the current draft is rejected with a refresh prompt.
- Groups can be collapsed and expanded; searching expands matches and pauses dragging.

Built-in groups and items use the `is_system` flag:

- Built-in items cannot be deleted.
- Built-in groups cannot be deleted.
- Built-in items can still be moved and reordered.
- A custom group can be deleted only when it is empty.
- Deleting a custom item cascades to its operation permissions, menu permission, and role grants.

## Show and Hide

`menu_items.hidden` only controls whether the sidebar shows the item; **it never changes authorization**:

- Hidden menus remain assignable to roles and remain reachable by direct route.
- Hiding Menu & Permissions or System Settings asks for confirmation, so an administrator cannot lose the entry by accident.
- The built-in Permission Overview (`permissions`) is hidden by default and is reachable from the account menu or the Menu & Permissions page.

## Dynamic Sidebar

The frontend no longer stores a hard-coded menu list. After login it requests:

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/menus/navigation` | Groups and items visible to the current user | Login |

The backend filters by user permission first, then returns the global order. Groups with no visible items are omitted.

## Management APIs

| Method | Path | Description | Permission |
| --- | --- | --- | --- |
| GET | `/api/menus` | Complete configuration, operation permissions, and layout version | `menus` or `permissions` |
| POST | `/api/menus/groups` | Create a custom group | `menus.create` |
| PUT | `/api/menus/groups/:id` | Rename a group | `menus.edit` |
| DELETE | `/api/menus/groups/:id` | Delete an empty custom group | `menus.delete` |
| POST | `/api/menus/items` | Create a custom item and permission | `menus.create` |
| PUT | `/api/menus/items/:code` | Update item metadata or visibility | `menus.edit` |
| DELETE | `/api/menus/items/:code` | Delete a custom item, its operation permissions, and grants | `menus.delete` |
| PUT | `/api/menus/layout` | Atomically save group and item order | `menus.reorder` |

## Adding a Business Page

Administrators may enter any route, but the page component still has to exist in code:

1. Implement the page under `pages/settings/<Domain>/`.
2. Register the path in the frontend router.
3. Create the menu and permission code on the Menu & Permissions page, or add it to the built-in catalog.
4. Grant the menu permission to the appropriate roles.

Creating only the menu without registering the route leads to a 404. Production releases should treat page code, routing, menu metadata, and role grants as one change set.

## Operation Permissions

Operation permissions under each menu (such as `users.create`) are maintained on the Menu & Permissions page:

- Sorted by code and excluded from layout saves.
- New codes can be generated from preset verbs (view, create, edit, delete, export, import).
- Roles can grant individual operation permissions. A menu granted without any operation shows as checked with a `0/N` count.

## Frontend Pages

- React: `src/pages/settings/menu/index.tsx` (desktop table in `MenuTreeTable.tsx`)
- Vue: `src/pages/settings/MenuManage/index.vue` (desktop table in `MenuTreeTable.vue`)
- Svelte: `src/routes/(app)/settings/menu/+page.svelte` (drag logic in `menu-drag.ts` alongside it)

The backend stores stable icon names, and the frontend renders them through a restricted icon map instead of loading components from database data.

## Related Pages

- [Permission System](/en/features/rbac/)
- [Permission Overview](/en/features/rbac/#permission-overview)
- [Permission Codes](/en/reference/permissions/)
- [Frontend Structure](/en/generated/frontend/)
- [API Reference](/en/reference/api/)
