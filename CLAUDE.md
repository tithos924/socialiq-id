# CLAUDE.md — SocialIQ AI

Guidance for any Claude session working on this repository.

## What this is

**SocialIQ AI** ("Your AI Social Media Strategist") is a production-grade,
multi-tenant SaaS that connects a business's social media accounts,
analyzes their content and performance, and generates an actionable content
strategy. Core loop: **Analyze -> Diagnose -> Strategize -> Create -> Publish ->
Measure -> Learn.**

Full product/technical specification: see `docs/specification-master.md`.

## Non-negotiable rules

- **Never fabricate.** No fake metrics, no invented API endpoints, no mocked
  analytics presented as real. If an integration needs credentials, OAuth
  approval, or app review that isn't configured yet, implement the
  architecture and clearly document what's missing — don't stub fake data.
- **Multi-tenant by default.** Every table that holds tenant data carries
  `organization_id`. Row Level Security (RLS) must be enabled and tested —
  one organization must never be able to read another's data.
- **Secrets never reach the client.** No access tokens, API keys, or service
  role keys in client-side code or client-visible responses.
- **Clean architecture.** UI -> application logic -> services -> external APIs
  -> database. Business logic does not live inside UI components. All social
  platform calls go through the `SocialProvider` interface
  (`src/services/social/social-provider.interface.ts`) — never call a
  platform SDK directly from application code.
- **AI provider abstraction.** All AI calls go through `src/services/ai` —
  the app must be able to switch models/providers without touching call
  sites.
- **Deterministic scoring.** The Social Score and its sub-scores are
  calculated in code, not invented by the AI. The AI explains the score; it
  does not decide it.
- **Work in phases.** Do not attempt to build unrelated modules in the same
  session. See `docs/roadmap.md` for the phase list. At the end of a phase,
  report: completed, files changed, DB changes, tests, known issues, next
  phase.

## Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS,
  shadcn/ui (manually configured — see note in `docs/development.md`)
- **Backend:** Supabase (Postgres, Auth, Storage, Edge Functions)
- **Infra:** Vercel (frontend), Supabase (backend), optional Redis/Upstash,
  Sentry (errors), PostHog (product analytics)

## Where things live

```
src/
  app/                 Next.js routes (UI + /api route handlers)
  components/ui/       shadcn/ui primitives
  services/
    social/            Platform adapters (meta, tiktok, youtube, linkedin)
                        implementing SocialProvider
    ai/                 AI orchestration layer (provider-agnostic)
    scoring/            Deterministic Social Score engine
    billing/            Payment provider abstraction
  lib/
    supabase/           Supabase client factories (server + browser)
    db/                 Query helpers
  types/                Shared TypeScript types
supabase/
  migrations/           SQL migrations (source of truth for schema)
  functions/            Edge Functions
docs/                   Architecture, database, security, roadmap docs
```

## Before making changes

1. Inspect the existing code — don't duplicate components or utilities that
   already exist.
2. Don't introduce a new dependency if an existing one already solves the
   problem.
3. Don't disable RLS, remove security checks, or hardcode credentials to
   make something "work."
4. Prefer Supabase migrations over ad-hoc schema edits.
5. Explain architectural changes before making them.

## Design system

Distinct visual identity, chosen deliberately (not a generic SaaS
template) — see `docs/design.md` for the full token rationale. In short:
white/sage canvas, forest-green primary, amber accent, deep ink-green
sidebar; Space Grotesk for display, Inter for body, JetBrains Mono for
data/numbers. Signature element: the Social Score rendered as an analog
instrument dial (`src/components/social-score-dial.tsx`), not a generic
"big number" card.

## Current status

Phases 1–5 complete (foundation, auth/multi-tenancy, full database schema
with RLS, dashboard UI shell with design system, business profile
onboarding wizard). See `docs/roadmap.md`. Next: Phase 6 (Social
integrations — Meta/Instagram + Facebook first).
