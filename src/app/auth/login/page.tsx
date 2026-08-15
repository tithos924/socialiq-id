"use client"

import { useActionState } from "react"
import Link from "next/link"
import { login, type AuthActionState } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState: AuthActionState = {}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState)

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
          <p className="text-sm text-muted-foreground">
            Acede à tua conta SocialIQ AI
          </p>
        </div>

        <form action={formAction} className="space-y-4">
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
              autoComplete="current-password"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "A entrar..." : "Entrar"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Ainda não tens conta?{" "}
          <Link href="/auth/register" className="underline underline-offset-4">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}
