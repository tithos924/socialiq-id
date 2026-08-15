"use client"

import { useActionState } from "react"
import Link from "next/link"
import { signup, type AuthActionState } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState: AuthActionState = {}

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(signup, initialState)

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Criar conta</h1>
          <p className="text-sm text-muted-foreground">
            Começa a analisar e a planear a tua estratégia de redes sociais
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Nome do negócio</Label>
            <Input id="businessName" name="businessName" type="text" autoComplete="organization" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Palavra-passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground">Mínimo de 8 caracteres.</p>
          </div>

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "A criar conta..." : "Criar conta"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Já tens conta?{" "}
          <Link href="/auth/login" className="underline underline-offset-4">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
