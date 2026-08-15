# SocialIQ AI — Master Specification

> Source of truth for product scope, architecture, phase plan, and rules.
> Kept in the repo for reference by any future development session.

## Project

**Name:** SocialIQ AI
**Tagline:** "Your AI Social Media Strategist"

## Vision

SocialIQ AI is an AI-powered social media strategist. It connects a user's
social media accounts, analyzes their business, niche, audience, content
and available performance data, identifies weaknesses and opportunities,
and generates an actionable content strategy.

Core value proposition:

```
ANALYZE -> DIAGNOSE -> STRATEGIZE -> CREATE -> PUBLISH -> MEASURE -> LEARN
```

Not just an AI content generator — a strategist that answers:

- What am I doing wrong?
- What is missing from my social media strategy?
- What should I publish today / this week?
- What content is performing best? What should I stop doing?
- What opportunities am I missing?

## Target users

Small businesses, entrepreneurs, content creators, personal brands, social
media managers, marketing agencies, e-commerce and local businesses.
Initial geographic focus: Angola / Portuguese-speaking markets, with an
architecture that supports international users and future localization
(Portuguese + English at launch).

## Core product modules

Authentication; Organization/Workspace management; Business profile;
Social account connections; Social analytics; Social Score; Content Gap
Analyzer; Niche Analyzer; Competitor Intelligence; AI Strategy Engine; AI
Content Studio; AI Video Script Generator; Content Calendar; Content
Library; Publishing/Scheduling; Performance Analytics; AI Learning Engine;
Notifications; Subscription architecture; Agency Mode; Settings; Admin
dashboard; Audit logs.

## Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Postgres, Auth, Storage, Edge Functions)
- **AI:** provider-abstraction layer — never hard-coded to one AI vendor
- **Infra:** Vercel (frontend), Supabase (backend), optional Redis/Upstash,
  Sentry (errors), PostHog (product analytics)

Details on layering, multi-tenancy, and the `SocialProvider` adapter
interface: see `docs/architecture.md`.

## Multi-tenancy

Multi-tenant by organization/workspace. Every table carries
`organization_id`. Row Level Security is mandatory and must be tested — one
organization must never access another's data.

## Social networks — phased rollout

- Phase 1: Instagram, Facebook
- Phase 2: TikTok, YouTube
- Phase 3: LinkedIn

Official APIs only. No scraping, no bypassing platform restrictions, no
fabricated integrations. Where an API requires app review/special
permissions, the integration architecture is implemented and the required
configuration, permissions, and env vars are documented (see
`docs/social-integrations.md`).

## Database

Core tables: users, organizations, organization_members, business_profiles,
social_accounts, social_platforms, social_posts, post_metrics,
content_pillars, content_ideas, content_calendar, content_assets,
strategies, strategy_recommendations, competitors, competitor_snapshots,
audience_profiles, analytics_snapshots, ai_generations, ai_usage,
notifications, subscriptions, plans, payments, audit_logs. Column-level
detail: `docs/database.md` and the migrations themselves.

## Social Score

A deterministic scoring engine (computed in code, not by the AI):

- Profile Optimization Score
- Content Consistency Score
- Content Diversity Score
- Engagement Score
- Growth Score
- Conversion Readiness Score
- Strategy Score
- Overall Social Score (0–100), computed from the above

The AI explains the score; it never invents it.

## Content Gap Analyzer & Niche Analyzer

Analyzes content-pillar distribution (e.g. educational/promotional/
entertainment/authority/social-proof mix) against a recommended mix, and
adapts recommendations to the business's specific niche, sub-niche,
audience, geography, goals, and platform (e.g. a restaurant's content needs
differ from a barbershop's or a real-estate agency's).

## AI architecture

Orchestration modules: Profile Analyzer, Niche Analyzer, Content Analyzer,
Content Gap Analyzer, Strategy Generator, Content Generator, Video Script
Generator, Competitor Analyzer, Performance Analyzer, Opportunity Engine.
Centralized, versioned prompt templates — the prompt version used is stored
on each `ai_generations` row. AI context is structured (business profile +
niche + audience + goals + historical posts/metrics + content gaps +
pillars + platform + competitor signals + previous strategy); missing data
is reported as unavailable, never fabricated. See `docs/ai-engine.md`.

## AI Strategy Engine

Generates strategies for 7/14/30/90-day horizons: content pillars, posting
frequency, platform strategy, recommended formats, objectives, themes,
hooks, CTAs, content mix, and day-by-day recommendations.

## AI Content Studio & Video Script Generator

Idea/post/carousel/reel/TikTok/caption/CTA/hashtag/video-script generation,
editable before saving. Video scripts include title, hook, scene
breakdown, narration, on-screen text, B-roll suggestions, CTA, and caption,
for 15/30/45/60/90-second durations.

## Content Calendar & Library

Calendar with month/week/day views; item statuses: Idea, Draft, Ready,
Scheduled, Published, Failed; actions: edit, duplicate, delete, move,
schedule, publish. Library is searchable/filterable by platform, format,
pillar, objective, status, date.

## Analytics & AI Performance Analysis

Dashboard covering followers, growth, reach, impressions, views,
likes/comments/shares/saves, engagement rate, over 7/30/90-day or custom
ranges, plus best/worst content, best format/topic/platform, and growth
trend. The AI explains real, database-backed results only — it never
invents statistics that don't exist in the data.

## Opportunity Engine

Identifies content opportunities, underused topics, formats competitors
use that the user doesn't, audience questions, potential series, recurring
formats, and conversion opportunities — each scored on impact and
confidence (0–100), with a title, description, potential impact,
difficulty, reason, and recommended action.

## Competitor Intelligence

Tracks public competitor accounts using only legally/officially accessible
information: posting frequency, content types, recurring topics, public
engagement indicators, strongest content, patterns, and opportunities.
Never copies or reproduces competitor content — strategic insights only.

## AI Learning Engine

Closes the loop: Post -> Metrics -> Performance Analysis -> Pattern
Detection -> Strategy Update -> Future Recommendations. Learned signals are
stored; strategy is not changed based on a single data point — minimum
sample sizes are used where appropriate.

## Dashboard & landing page

Premium SaaS dashboard (sidebar: Dashboard, Analytics, Strategy, Content
Calendar, AI Content Studio, Ideas, Competitors, Social Accounts, Reports,
Settings) and a conversion-focused landing page (Hero: "Your AI Social
Media Strategist" / "Connect your social networks, discover what's
missing, and know exactly what to publish every day."). No fake
testimonials — clearly marked placeholders only, until real ones exist.

## Billing

Plans: FREE, STARTER, PRO, AGENCY, each with defined limits (workspaces,
connected accounts, AI generations, features). Payment provider logic is
isolated behind a billing service abstraction, not hard-coded throughout
the app.

## Agency Mode

Agency accounts manage multiple client workspaces, each with its own
business profile, social accounts, strategy, calendar, and analytics, with
workspace switching.

## Security

No secrets in the frontend or in public tables; server-side handling of
sensitive actions; RLS everywhere; input validation/sanitization; rate
limiting where needed; secure OAuth state; validated webhook signatures;
server-side re-verification of organization membership (client-provided
IDs are never trusted); audit logs for sensitive actions. See
`docs/security.md`.

## Testing

Authentication, RLS (explicitly: one org can never read another's data),
database operations, social services, AI service, scoring engine, content
generation, strategy generation, API endpoints, and critical UI flows are
all covered by tests.

## Development workflow — phases

See `docs/roadmap.md` for the full phase list (1–18) and the end-of-phase
report format. Work proceeds one phase at a time; each phase ends with a
completion report before the next begins.

## MVP priority

The first usable version focuses on: authentication, business onboarding,
social connection architecture, Instagram/Facebook integration, analytics,
Social Score, Content Gap Analyzer, AI strategy, 30-day content calendar,
AI video scripts, and content library. Everything else is incremental.

## MVP success criteria

A user can: create an account -> create a business -> connect eligible
social accounts -> import available social data -> receive a Social Score
-> see what's missing -> get personalized recommendations -> generate a
30-day content strategy -> generate video scripts -> save ideas -> organize
them in a calendar -> review analytics. If these twelve things work
reliably, the MVP is successful.

## Product principle

Every analysis must end in an actionable recommendation grounded in
business + niche + audience + goals + real data + historical performance —
never generic AI advice or a dashboard of numbers without a "so what."
