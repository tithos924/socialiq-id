# Architecture

## Layering

```
UI  ->  Application logic  ->  Services  ->  External APIs  ->  Database
```

Business logic never lives directly inside UI components.

## Social platform adapters

All external social platform calls go through a common `SocialProvider`
interface (`src/services/social/social-provider.interface.ts`). Each
platform (Meta, TikTok, YouTube, LinkedIn) implements this interface in its
own folder under `src/services/social/<platform>/`. Only methods the
platform's official API actually supports are implemented; unsupported
methods throw `NotSupportedError` rather than returning fabricated data.

## AI orchestration

AI calls are centralized behind `src/services/ai`, using a provider
abstraction so the underlying model/provider can change without touching
call sites. Prompt templates are centralized and versioned; the prompt
version used for a generation is stored alongside the result
(`ai_generations.prompt_version`).

## Multi-tenancy

Every tenant-owned table carries `organization_id`. Supabase Row Level
Security (RLS) policies enforce that a user can only read/write rows
belonging to organizations they are a member of. Organization membership is
always verified server-side — client-provided organization IDs are never
trusted directly.
