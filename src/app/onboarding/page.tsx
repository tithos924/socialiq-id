import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Conta confirmada
        </h1>
        <p className="text-sm text-muted-foreground">
          O fluxo completo de onboarding (perfil do negócio, nicho, objetivos,
          voz da marca) é construído na Fase 5. Por agora, segue para o
          dashboard.
        </p>
        <Button asChild className="w-full">
          <Link href="/dashboard">Ir para o Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
