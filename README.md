# Flowboard

Mini project-management app (ClickUp / Asana / Linear at hobby scale) built as a frontend take-home. Single workspace, mock users, no backend.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # Vitest
npm run storybook        # http://localhost:6006 (component stories)
npm run build-storybook  # static Storybook build
npm run build    # production build
```

State is in-memory only — a refresh resets to seed data (no `localStorage`).

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ Components  │────▶│ Hooks        │────▶│ RTK Query   │
│ (UI only)   │     │ useRunMutation│     │ api.js      │
└─────────────┘     │ useCurrentUser│     └──────┬──────┘
                    └──────────────┘            │
                                                ▼
                                        ┌───────────────┐
                                        │ service.js    │
                                        │ (pure CRUD +  │
                                        │  permissions) │
                                        └───────┬───────┘
                                                │ upserts / removals
                                                ▼
                                        ┌───────────────┐
                                        │ Redux slices  │
                                        │ containers /  │
                                        │ tasks / users │
                                        │ grants / ui   │
                                        └───────────────┘
```

- **Components** never encode business rules; they call mutations and selectors.
- **RTK Query** uses `fakeBaseQuery` + `queryFn` (no network). Mutations dispatch generic slice upserts after a successful service call.
- **service.js** is the single source of truth for CRUD, validation, and permission checks.

## Data model

| Entity | Shape (plain objects) |
|--------|------------------------|
| User | `{ id, name, role: 'admin'\|'member', color }` |
| Container | `{ id, name, type, parentId, position, visibility, archivedAt }` — lists also have `statuses[]` |
| Task | `{ id, title, description, status, priority, assigneeIds, dueDate, position, primaryListId, createdAt, updatedAt }` |
| Grant | `{ resourceId, userId, mode: 'allow'\|'deny' }` |

JSDoc typedefs for these models live in `src/types/models.js` (JavaScript-only stack; no TypeScript).

Hierarchy: **workspace → space → folder → list → tasks**.

Seed: Acme Team workspace; Alice (admin), Bob & Carol (members); Engineering / Marketing spaces; 3 lists; 20 tasks; grants as documented in `src/data/seedData.js`.

## Permissions

Rule (also in `src/services/permissions.js`):

`canViewNode(node, user)` = admin **OR** (parent is viewable **AND** (if user has a grant on node then `mode === 'allow'`; else if `visibility === 'private'` then false; else true)). Archived nodes are never viewable.

Enforcement:

- Tree / task reads filter inside `service.js` (`getVisibleTree`, `getTasksByList`).
- Mutations check `isAdmin` / `canEditTask` and return `{ error: { code: 'FORBIDDEN', message } }`.
- UI hides admin-only controls for members; service still rejects member container mutations.
- User switch: `setCurrentUser` + `api.util.resetApiState()` so tree/board refetch.

Expected demo:

- **Alice** — everything.
- **Bob** — Engineering → Q2 Launch → Backlog + Sprint Board (private + allow).
- **Carol** — Engineering → Q2 Launch (empty; Backlog denied, Sprint hidden) + Marketing → Campaigns → Content Plan.

## Soft delete

Containers use **`archivedAt`** (ISO or `null`). Archive cascades to all descendants. Tasks on archived lists are unreachable via reads. **No restore UI.**

## Persistence

None. Redux state resets to fixtures on refresh.

## Assumptions

- Only **admins** can create / rename / reorder / archive containers; members get `FORBIDDEN`.
- New containers default to **`visibility: 'public'`** (no visibility UI).
- Workspace is **rename-only** (never created or archived in-app).
- `src/index.css` contains only the three `@tailwind` directives (standard Tailwind boilerplate — not custom app CSS).
- Sprint Board seed includes an extra **"In Review"** status.
- Sibling containers must have unique names (case-insensitive); duplicates return a `CONFLICT` error.
- Task descriptions are plain text (no markdown renderer).
- No inline `style=` attributes were used (native HTML5 DnD needs none).

## Trade-offs & week 2

**Stretch goals attempted:** client-side search and Storybook. Search: top-bar input filters the selected list's tasks by title/description (case-insensitive, all words must match) in both board and list views via `src/services/search.js`; the query resets when you switch lists. Storybook (Storybook 8 + Vite; stories live next to components as `*.stories.jsx`, with a seeded Redux store provided in `.storybook/preview.jsx`).

**Cut / not attempted:** subtasks, status-set editing UI, pagination, optimistic DnD, activity feed, bulk update, keyboard shortcuts, deploy preview.

**Week 2:** optimistic moves with rollback, list status configuration UI, client search, richer inheritance for grants, restore-from-archive, and a short Loom demo of Alice vs Bob permissions.

## Extending permissions

Today grants are per-container allow/deny with parent visibility AND-ed. Next steps:

1. **Team grants** — attach grants to a team id; expand membership at evaluation time.
2. **Inheritance modes** — explicit `inherit | override` so a public child under a private parent can opt in.
3. **Viewer / editor** — split `canViewNode` from `canEditTask` with grant modes `view` | `edit` | `deny`.

## AI usage

See [AI_USAGE.md](./AI_USAGE.md) for prompts, corrections, and rejected suggestions.

## Styling note

Tailwind utility classes in JSX only. Theme tokens live in `tailwind.config.js`. Shared `PriorityBadge` / `StatusBadge` keep colors identical on the board and list view. No CSS modules, SCSS, CSS-in-JS, or inline `style=`.
