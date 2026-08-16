# Meta adapter (Instagram / Facebook)

Implemented in `meta-provider.ts`, conforming to the `SocialProvider`
interface. Covers: OAuth connect, long-lived token exchange/refresh,
profile, posts, post metrics, audience metrics, publish (image only —
Instagram's API has no text-only post endpoint), disconnect.

## Requires (see docs/social-integrations.md)

- `META_CLIENT_ID`, `META_CLIENT_SECRET` — from a Meta App with
  "Facebook Login" + "Instagram Graph API" products added
- `TOKEN_ENCRYPTION_KEY` — for encrypting stored tokens
  (`src/lib/crypto/token-encryption.ts`)
- OAuth redirect URI registered in the Meta App:
  `<site-url>/api/social/meta/callback`
- While the Meta App is in Development mode, only the app's own
  admins/testers can connect accounts. Connecting other users' accounts
  requires Meta App Review for the `instagram_basic`,
  `instagram_manage_insights`, and `pages_show_list` permissions.

## Routes

- `GET /api/social/meta/connect` — starts the OAuth flow (signed state)
- `GET /api/social/meta/callback` — exchanges the code, verifies state,
  stores the encrypted token in `social_accounts`
