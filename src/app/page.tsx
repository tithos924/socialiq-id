import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SocialScoreDial } from "@/components/social-score-dial"

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-10 px-4 py-16 text-center">
      <span className="font-display text-sm font-semibold tracking-wide text-primary">
        SOCIALIQ AI
      </span>

      <div className="max-w-xl space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Your AI Social Media Strategist
        </h1>
        <p className="mx-auto max-w-md text-muted-foreground">
          Liga as tuas redes sociais, descobre o que falta na tua estratégia,
          e sabe exatamente o que publicar todos os dias.
        </p>
      </div>

      <div className="space-y-1">
        <SocialScoreDial score={68} size={180} />
        <p className="text-xs text-muted-foreground">Exemplo de Social Score</p>
      </div>

      <div className="flex gap-3">
        <Button asChild size="lg">
          <Link href="/auth/register">Começar grátis</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/auth/login">Entrar</Link>
        </Button>
      </div>
    </div>
  )
}
