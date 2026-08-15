import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Your AI Social Media Strategist
        </h1>
        <p className="mx-auto max-w-md text-muted-foreground">
          Liga as tuas redes sociais, descobre o que falta na tua estratégia,
          e sabe exatamente o que publicar todos os dias.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/auth/register">Começar grátis</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/auth/login">Entrar</Link>
        </Button>
      </div>
    </div>
  )
}
