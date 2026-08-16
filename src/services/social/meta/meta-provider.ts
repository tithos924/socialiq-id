import type {
  AudienceMetrics,
  OAuthConnectResult,
  PostMetrics,
  PublishPostInput,
  PublishPostResult,
  SocialPlatform,
  SocialPost,
  SocialProfile,
  SocialProvider,
} from "../social-provider.interface"
import { NotSupportedError } from "../social-provider.interface"

const GRAPH_API_VERSION = "v21.0"
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`

/**
 * Meta adapter — Instagram (via Instagram Graph API, business/creator
 * accounts only) and Facebook Pages, through Facebook Login OAuth.
 *
 * Requires (see docs/social-integrations.md):
 * - META_CLIENT_ID, META_CLIENT_SECRET
 * - Meta App with "Facebook Login" + "Instagram Graph API" products
 * - App review for permissions beyond basic profile access, before this
 *   can be used with accounts other than the app's own testers/admins
 */
export class MetaProvider implements SocialProvider {
  readonly platform: SocialPlatform = "instagram"

  private get clientId() {
    const id = process.env.META_CLIENT_ID
    if (!id) throw new Error("META_CLIENT_ID is not configured.")
    return id
  }

  private get clientSecret() {
    const secret = process.env.META_CLIENT_SECRET
    if (!secret) throw new Error("META_CLIENT_SECRET is not configured.")
    return secret
  }

  async connect(
    authorizationCode: string,
    redirectUri: string
  ): Promise<OAuthConnectResult> {
    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: redirectUri,
      code: authorizationCode,
    })

    const res = await fetch(`${GRAPH_BASE}/oauth/access_token?${params}`)
    if (!res.ok) {
      throw new Error(`Meta OAuth exchange failed: ${await res.text()}`)
    }
    const json = (await res.json()) as {
      access_token: string
      token_type: string
      expires_in?: number
    }

    // Short-lived token -> exchange for a long-lived one (~60 days).
    const longLivedParams = new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: this.clientId,
      client_secret: this.clientSecret,
      fb_exchange_token: json.access_token,
    })
    const longLivedRes = await fetch(
      `${GRAPH_BASE}/oauth/access_token?${longLivedParams}`
    )
    if (!longLivedRes.ok) {
      throw new Error(
        `Meta long-lived token exchange failed: ${await longLivedRes.text()}`
      )
    }
    const longLived = (await longLivedRes.json()) as {
      access_token: string
      expires_in?: number
    }

    const meRes = await fetch(
      `${GRAPH_BASE}/me?fields=id&access_token=${longLived.access_token}`
    )
    const me = (await meRes.json()) as { id: string }

    return {
      platformUserId: me.id,
      accessToken: longLived.access_token,
      expiresAt: longLived.expires_in
        ? new Date(Date.now() + longLived.expires_in * 1000)
        : undefined,
      scopes: [],
    }
  }

  async refreshToken(refreshToken: string): Promise<OAuthConnectResult> {
    // Meta long-lived tokens are refreshed by re-exchanging the still-valid
    // long-lived token, not via a separate refresh_token — there is no
    // distinct refresh token in this flow.
    const params = new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: this.clientId,
      client_secret: this.clientSecret,
      fb_exchange_token: refreshToken,
    })
    const res = await fetch(`${GRAPH_BASE}/oauth/access_token?${params}`)
    if (!res.ok) {
      throw new Error(`Meta token refresh failed: ${await res.text()}`)
    }
    const json = (await res.json()) as {
      access_token: string
      expires_in?: number
    }

    const meRes = await fetch(
      `${GRAPH_BASE}/me?fields=id&access_token=${json.access_token}`
    )
    const me = (await meRes.json()) as { id: string }

    return {
      platformUserId: me.id,
      accessToken: json.access_token,
      expiresAt: json.expires_in
        ? new Date(Date.now() + json.expires_in * 1000)
        : undefined,
      scopes: [],
    }
  }

  async getProfile(accessToken: string): Promise<SocialProfile> {
    const res = await fetch(
      `${GRAPH_BASE}/me?fields=id,name,username&access_token=${accessToken}`
    )
    if (!res.ok) {
      throw new Error(`Meta getProfile failed: ${await res.text()}`)
    }
    const json = (await res.json()) as {
      id: string
      name?: string
      username?: string
    }

    return {
      platformUserId: json.id,
      username: json.username ?? json.id,
      displayName: json.name ?? json.username ?? json.id,
    }
  }

  async getPosts(accessToken: string, since?: Date): Promise<SocialPost[]> {
    const params = new URLSearchParams({
      fields: "id,caption,media_type,permalink,timestamp",
      access_token: accessToken,
    })
    if (since) params.set("since", String(Math.floor(since.getTime() / 1000)))

    const res = await fetch(`${GRAPH_BASE}/me/media?${params}`)
    if (!res.ok) {
      throw new Error(`Meta getPosts failed: ${await res.text()}`)
    }
    const json = (await res.json()) as {
      data: Array<{
        id: string
        caption?: string
        media_type?: string
        permalink?: string
        timestamp: string
      }>
    }

    return json.data.map((p) => ({
      platformPostId: p.id,
      contentType: p.media_type ?? "unknown",
      caption: p.caption,
      permalink: p.permalink,
      publishedAt: new Date(p.timestamp),
    }))
  }

  async getPostMetrics(
    accessToken: string,
    platformPostId: string
  ): Promise<PostMetrics> {
    const metrics = [
      "impressions",
      "reach",
      "saved",
      "likes",
      "comments",
    ].join(",")
    const res = await fetch(
      `${GRAPH_BASE}/${platformPostId}/insights?metric=${metrics}&access_token=${accessToken}`
    )
    if (!res.ok) {
      throw new Error(`Meta getPostMetrics failed: ${await res.text()}`)
    }
    const json = (await res.json()) as {
      data: Array<{ name: string; values: Array<{ value: number }> }>
    }

    const byName = Object.fromEntries(
      json.data.map((m) => [m.name, m.values[0]?.value ?? 0])
    )

    return {
      platformPostId,
      impressions: byName["impressions"],
      reach: byName["reach"],
      saves: byName["saved"],
      likes: byName["likes"],
      comments: byName["comments"],
      recordedAt: new Date(),
    }
  }

  async getAudienceMetrics(accessToken: string): Promise<AudienceMetrics> {
    const res = await fetch(
      `${GRAPH_BASE}/me?fields=followers_count&access_token=${accessToken}`
    )
    if (!res.ok) {
      throw new Error(`Meta getAudienceMetrics failed: ${await res.text()}`)
    }
    const json = (await res.json()) as { followers_count?: number }

    return {
      followersCount: json.followers_count ?? 0,
      recordedAt: new Date(),
    }
  }

  async publishPost(
    accessToken: string,
    input: PublishPostInput
  ): Promise<PublishPostResult> {
    if (!input.mediaUrls?.length) {
      throw new NotSupportedError(
        this.platform,
        "publishPost (Instagram requires at least one media URL — text-only posts are not supported)"
      )
    }

    // Two-step publish: create a media container, then publish it.
    const containerParams = new URLSearchParams({
      image_url: input.mediaUrls[0],
      caption: input.caption ?? "",
      access_token: accessToken,
    })
    const containerRes = await fetch(`${GRAPH_BASE}/me/media?${containerParams}`, {
      method: "POST",
    })
    if (!containerRes.ok) {
      throw new Error(`Meta publish (container) failed: ${await containerRes.text()}`)
    }
    const container = (await containerRes.json()) as { id: string }

    const publishParams = new URLSearchParams({
      creation_id: container.id,
      access_token: accessToken,
    })
    const publishRes = await fetch(
      `${GRAPH_BASE}/me/media_publish?${publishParams}`,
      { method: "POST" }
    )
    if (!publishRes.ok) {
      throw new Error(`Meta publish failed: ${await publishRes.text()}`)
    }
    const published = (await publishRes.json()) as { id: string }

    return { platformPostId: published.id }
  }

  async disconnect(accessToken: string): Promise<void> {
    const params = new URLSearchParams({ access_token: accessToken })
    await fetch(`${GRAPH_BASE}/me/permissions?${params}`, { method: "DELETE" })
  }
}
