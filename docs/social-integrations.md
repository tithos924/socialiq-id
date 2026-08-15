# Social Integrations

Each platform integration is implemented as an adapter under
`src/services/social/<platform>/`, conforming to the `SocialProvider`
interface. Only official platform APIs are used — no scraping, no bypassing
API restrictions.

## Phase order

- Phase 1 (of social integrations): Instagram, Facebook (Meta)
- Phase 2: TikTok, YouTube
- Phase 3: LinkedIn

## Per-platform requirements (filled in as each is implemented)

### Meta (Instagram / Facebook)
- Required configuration: Meta App with Instagram Graph API + Facebook
  Login products enabled.
- Required permissions: instagram_basic, pages_show_list,
  instagram_manage_insights (subject to change per Meta's current docs).
- Required app review: yes, for permissions beyond basic profile access.
- Required env vars: `META_CLIENT_ID`, `META_CLIENT_SECRET`.

### TikTok
- Required configuration: TikTok for Developers app, Content Posting API /
  Display API access.
- Required app review: yes.
- Required env vars: `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`.

### YouTube
- Required configuration: Google Cloud project, YouTube Data API v3
  enabled, OAuth consent screen (verification needed for sensitive scopes
  in production).
- Required env vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

### LinkedIn
- Required configuration: LinkedIn app, Marketing Developer Platform
  access (partner approval required for most posting/analytics scopes).
- Required env vars: `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`.
