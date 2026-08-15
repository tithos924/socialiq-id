/**
 * SocialProvider
 *
 * Common interface every platform adapter (Meta, TikTok, YouTube, LinkedIn...)
 * must implement. The rest of the application talks to this interface only —
 * it never imports a platform-specific SDK directly.
 *
 * Only implement the methods actually supported by a given platform's official
 * API. Unsupported methods should throw a clear `NotSupportedError` rather than
 * being silently stubbed out.
 */

export type SocialPlatform = "instagram" | "facebook" | "tiktok" | "youtube" | "linkedin"

export interface OAuthConnectResult {
  platformUserId: string
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
  scopes: string[]
}

export interface SocialProfile {
  platformUserId: string
  username: string
  displayName: string
  followersCount?: number
  profileImageUrl?: string
}

export interface SocialPost {
  platformPostId: string
  contentType: string
  caption?: string
  permalink?: string
  publishedAt: Date
}

export interface PostMetrics {
  platformPostId: string
  views?: number
  likes?: number
  comments?: number
  shares?: number
  saves?: number
  reach?: number
  impressions?: number
  recordedAt: Date
}

export interface AudienceMetrics {
  followersCount: number
  followersGrowth?: number
  demographics?: Record<string, unknown>
  recordedAt: Date
}

export interface PublishPostInput {
  caption?: string
  mediaUrls?: string[]
  contentType: string
}

export interface PublishPostResult {
  platformPostId: string
  permalink?: string
}

/**
 * Thrown when a method is called that the platform's official API does not
 * support (e.g. metrics retrieval where the platform provides no such
 * endpoint). Never fabricate a result instead of throwing this.
 */
export class NotSupportedError extends Error {
  constructor(platform: SocialPlatform, method: string) {
    super(`${method} is not supported by the ${platform} integration.`)
    this.name = "NotSupportedError"
  }
}

export interface SocialProvider {
  readonly platform: SocialPlatform

  /** Exchange an OAuth authorization code for tokens. */
  connect(authorizationCode: string, redirectUri: string): Promise<OAuthConnectResult>

  /** Refresh an expired/expiring access token. */
  refreshToken(refreshToken: string): Promise<OAuthConnectResult>

  /** Fetch the connected account's public profile data. */
  getProfile(accessToken: string): Promise<SocialProfile>

  /** Fetch recent posts, where the platform's API exposes this. */
  getPosts(accessToken: string, since?: Date): Promise<SocialPost[]>

  /** Fetch metrics for a specific post, where available. */
  getPostMetrics(accessToken: string, platformPostId: string): Promise<PostMetrics>

  /** Fetch audience-level metrics, where available. */
  getAudienceMetrics(accessToken: string): Promise<AudienceMetrics>

  /** Publish a post, where the platform's API officially supports publishing. */
  publishPost(accessToken: string, input: PublishPostInput): Promise<PublishPostResult>

  /** Revoke the connection on the platform side, if supported. */
  disconnect(accessToken: string): Promise<void>
}
