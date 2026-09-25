---
title: Menu Management
description: The dynamic sidebar data model, grouping and ordering rules, built-in menu constraints, and management APIs.
---

Menu management owns the sidebar's **presentation structure**, while the permission system owns **whether access is allowed**. Keeping them separate lets you change groups, order, routes, and icons without changing API authorization rules.

## Data Model

| Table | Purpose |
| --- | --- |
| `menu_groups` | Menu groups, names, global order, and built-in flags |
| `menu_items` | Permission code, group, route, icon, and item order |
| `permissions` | Permission code, name, type, and operation-permission parent; still the source of authorization |

Every menu item must reference a permission code whose type is `menu`. If a user does not hold that permission, the item is absent from the dynamic sidebar.

## Structure and Ordering

- Menus always use a two-level "group → item" structure; nested submenus are not supported.
- Groups and items can both be reordered by dragging.
- Items can be moved between groups.
- After editing, the user clicks Save and the frontend submits the complete layout at once.
- The backend uses `menu_layout_version` for optimistic locking. If another administrator saves first, the current draft is rejected with a refresh prompt.

Built-in groups and items use the `is_system` flag:

- Built-in items cannot be deleted.
- Built-in groups cannot be deleted.
- Built-in items can still be moved and reordered.
- A custom group can be deleted only when it is empty.
- Deleting a custom item also removes its menu permission and role grants.

## Dynamic Sidebar

The frontend no longer stores a hard-coded menu list. After login it requests:

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/menus/navigation` | Groups and items visible to the current user | Login |

The backend filters by user permission first, then returns the global order. Groups with no visible items are omitted.

## Management APIs

| Method | Path | Description | Permission |
| --- | --- | --- | --- |
| GET | `/api/menus` | Complete configuration and layout version | `menus` |
| POST | `/api/menus/groups` | Create a custom group | `menus.create` |
| PUT | `/api/menus/groups/:id` | Rename a group | `menus.edit` |
| DELETE | `/api/menus/groups/:id` | Delete an empty custom group | `menus.delete` |
| POST | `/api/menus/items` | Create a custom item and permission | `menus.create` |
| PUT | `/api/menus/items/:code` | Update item metadata | `menus.edit` |
| DELETE | `/api/menus/items/:code` | Delete a custom item and grants | `menus.delete` |
| PUT | `/api/menus/layout` | Atomically save group and item order | `menus.reorder` |

## Adding a Business Page

Administrators may enter any route, but the page component still has to exist in code:

1. Implement the page under `pages/settings/<Domain>/`.
2. Register the path in the frontend router.
3. Create the menu and permission code in menu management, or add it to the built-in catalog.
4. Grant the menu permission to the appropriate roles.

Creating only the menu without registering the route leads to a 404. Production releases should treat page code, routing, menu metadata, and role grants as one change set.

## Frontend Pages

- React: `src/pages/settings/menu/index.tsx`
- Vue: `src/pages/settings/MenuManage/index.vue`

The backend stores stable icon names, and the frontend renders them through a restricted icon map instead of loading components from database data.

## Related Pages

- [Permission System](/en/features/rbac/)
- [Permission Codes](/en/reference/permissions/)
- [Frontend Structure](/en/generated/frontend/)
- [API Reference](/en/reference/api/)
