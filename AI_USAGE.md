# AI usage log

## Tools

- Cursor agent (Composer) for scaffolding, service layer, Redux/RTK Query wiring, UI, tests, and README.

## Prompts (summary)

1. Review the assignment brief and guidelines against the build constraints; stop on conflicts.
2. Scaffold React 18 + Vite (JS) + Tailwind 3.4 + Vitest; implement Flowboard MVP end-to-end.
3. Keep business logic in pure `service.js`; UI via RTK Query mutations and toasts.

## Where AI helped

- Boilerplate: Vite/Tailwind/Vitest config, folder layout, seed fixtures.
- Pure permission/tree/move algorithms and Vitest coverage outlines.
- Headless UI Dialog wiring for the task drawer.
- Storybook 8 setup and component stories (stretch goal).

## Corrections applied

- Forced **JavaScript only** (brief prefers TypeScript; the build constraints forbid TS).
- Removed all **inline `style=`** (including depth indentation) in favor of nested `pl-*` classes.
- Ensured skeletons use **`isLoading`** (not background refetch) for board/list.
- Kept container mutations **admin-only** in both UI and service.
- Avoided extra libraries beyond `@headlessui/react` for the drawer Dialog.

## Rejected AI output

- TypeScript models / Zod schemas (stack lock).
- `@dnd-kit` / `react-beautiful-dnd` (spec requires native HTML5 DnD).
- `localStorage` persistence (explicitly out of scope for this build).
- Entity adapters / normalized entity slices (spec: plain arrays + generic upserts).
- Stretch goals (subtasks, search, optimistic UI) before MVP was complete.
