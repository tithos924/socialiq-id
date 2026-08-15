"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export interface AuthActionState {
  error?: string
}

export async function signup(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")
  const businessName = String(formData.get("businessName") ?? "")

  if (!email || !password) {
    return { error: "Preenche o email e a palavra-passe." }
  }
  if (password.length < 8) {
    return { error: "A palavra-passe precisa de pelo menos 8 caracteres." }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Consumed by the handle_new_user() DB trigger to name the
      // auto-created organization.
      data: { business_name: businessName || undefined },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect("/auth/check-email")
}

export async function login(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    return { error: "Preenche o email e a palavra-passe." }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: "Email ou palavra-passe incorretos." }
  }

  redirect("/dashboard")
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}
