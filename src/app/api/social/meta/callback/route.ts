import { NextResponse, type NextRequest } from "next/server"
import { createHmac, timingSafeEqual } from "crypto"
import { createClient } from "@/lib/supabase/server"
import { MetaProvider } from "@/services/social/meta/meta-provider"
import { encryptToken } from "@/lib/crypto/token-encryption"

function verifyState(state: string, secret: string): { organizationId: string } | null {
  const parts = state.split(".")
  if (parts.length !== 3) return null
  const [organizationId, nonce, signature] = parts

  const expected = createHmac("sha256", secret)
    .update(`${organizationId}.${nonce}`)
    .digest("hex")

  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  return { organizationId }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const errorParam = searchParams.get("error")

  if (errorParam) {
    return NextResponse.redirect(
      `${origin}/dashboard/accounts?error=${encodeURIComponent(errorParam)}`
    )
  }

  const secret = process.env.META_CLIENT_SECRET
  if (!code || !state || !secret) {
    return NextResponse.redirect(`${origin}/dashboard/accounts?error=invalid_request`)
  }

  const verified = verifyState(state, secret)
  if (!verified) {
    return NextResponse.redirect(`${origin}/dashboard/accounts?error=invalid_state`)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(`${origin}/auth/login`)
  }

  // Re-verify the caller is actually a member of the org encoded in state
  // — never trust the client-provided organization_id alone.
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .eq("organization_id", verified.organizationId)
    .maybeSingle()

  if (!membership) {
    return NextResponse.redirect(`${origin}/dashboard/accounts?error=not_authorized`)
  }

  try {
    const provider = new MetaProvider()
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/social/meta/callback`
    const result = await provider.connect(code, redirectUri)
    const profile = await provider.getProfile(result.accessToken)

    const { error } = await supabase.from("social_accounts").upsert(
      {
        organization_id: membership.organization_id,
        platform: "instagram",
        platform_user_id: result.platformUserId,
        username: profile.username,
        display_name: profile.displayName,
        access_token_encrypted: encryptToken(result.accessToken),
        token_expires_at: result.expiresAt?.toISOString() ?? null,
        status: "connected",
      },
      { onConflict: "organization_id,platform,platform_user_id" }
    )

    if (error) {
      return NextResponse.redirect(
        `${origin}/dashboard/accounts?error=${encodeURIComponent(error.message)}`
      )
    }

    return NextResponse.redirect(`${origin}/dashboard/accounts?connected=instagram`)
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error"
    return NextResponse.redirect(
      `${origin}/dashboard/accounts?error=${encodeURIComponent(message)}`
    )
  }
}
