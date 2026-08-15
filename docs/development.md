# Development

## Setup

```bash
npm install
cp .env.example .env.local   # fill in real values, never commit this file
npm run dev
```

## shadcn/ui note

The `shadcn` CLI fetches component definitions from `ui.shadcn.com`. In
some sandboxed environments that domain isn't reachable, so
`components.json` and `src/lib/utils.ts` were created manually to match
what the CLI would generate. If you have access to `ui.shadcn.com`, you can
still use `npx shadcn@latest add <component>` normally going forward.

## Conventions

- TypeScript strict mode.
- Tailwind CSS + shadcn/ui for UI primitives (`src/components/ui`).
- Path alias `@/*` -> `src/*`.
- One Supabase migration per schema change, in `supabase/migrations/`.
