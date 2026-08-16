import { NextResponse, type NextRequest } from "next/server"
import { createHmac, randomBytes } from "crypto"
import { createClient } from "@/lib/supabase/server"

const SCOPES = [
  "instagram_basic",
  "pages_show_list",
  "instagram_manage_insights",
].join(",")

/**
 * Starts the Meta OAuth flow. The `state` parameter is signed (HMAC) so
 * the callback can verify it wasn't tampered with (CSRF protection) —
 * see docs/security.md.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  const secret = process.env.META_CLIENT_SECRET
  const clientId = process.env.META_CLIENT_ID
  if (!secret || !clientId) {
    return NextResponse.json(
      { error: "META_CLIENT_ID / META_CLIENT_SECRET not configured." },
      { status: 500 }
    )
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle()

  if (!membership) {
    return NextResponse.json({ error: "No organization found." }, { status: 400 })
  }

  const nonce = randomBytes(16).toString("hex")
  const payload = `${membership.organization_id}.${nonce}`
  const signature = createHmac("sha256", secret).update(payload).digest("hex")
  const state = `${payload}.${signature}`

  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/social/meta/callback`

  const authUrl = new URL("https://www.facebook.com/v21.0/dialog/oauth")
  authUrl.searchParams.set("client_id", clientId)
  authUrl.searchParams.set("redirect_uri", redirectUri)
  authUrl.searchParams.set("state", state)
  authUrl.searchParams.set("scope", SCOPES)
  authUrl.searchParams.set("response_type", "code")

  return NextResponse.redirect(authUrl)
}
