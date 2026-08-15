"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export interface OnboardingActionState {
  error?: string
}

export async function saveBusinessProfile(
  _prevState: OnboardingActionState,
  formData: FormData
): Promise<OnboardingActionState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle()

  if (!membership) {
    return { error: "Não foi possível encontrar a tua organização." }
  }

  const businessName = String(formData.get("businessName") ?? "").trim()
  if (!businessName) {
    return { error: "O nome do negócio é obrigatório." }
  }

  const goals = formData.getAll("goals").map(String)

  const payload = {
    organization_id: membership.organization_id,
    business_name: businessName,
    niche: String(formData.get("niche") ?? "") || null,
    sub_niche: String(formData.get("subNiche") ?? "") || null,
    country: String(formData.get("country") ?? "") || null,
    city: String(formData.get("city") ?? "") || null,
    description: String(formData.get("description") ?? "") || null,
    target_audience: String(formData.get("targetAudience") ?? "") || null,
    products: String(formData.get("products") ?? "") || null,
    services: String(formData.get("services") ?? "") || null,
    goals,
    brand_voice: String(formData.get("brandVoice") ?? "") || null,
    website: String(formData.get("website") ?? "") || null,
  }

  const { error } = await supabase
    .from("business_profiles")
    .upsert(payload, { onConflict: "organization_id" })

  if (error) {
    return { error: error.message }
  }

  redirect("/dashboard")
}
