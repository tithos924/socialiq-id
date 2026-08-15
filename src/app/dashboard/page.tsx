import {
  TrendingUp,
  Users,
  Eye,
  Heart,
  FileEdit,
  ListChecks,
  Sparkles,
  Compass,
} from "lucide-react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SocialScoreDial } from "@/components/social-score-dial"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { EmptyState } from "@/components/dashboard/empty-state"

const METRIC_CARDS = [
  { label: "Seguidores", icon: Users },
  { label: "Alcance", icon: Eye },
  { label: "Engagement", icon: Heart },
  { label: "Conteúdo publicado", icon: FileEdit },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Real reads, scoped by RLS. Empty for now — populated from Phase 6
  // (social integrations) onward. Never fabricated.
  const { data: socialAccounts } = await supabase
    .from("social_accounts")
    .select("id")
    .limit(1)

  const hasConnectedAccounts = (socialAccounts?.length ?? 0) > 0

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          A tua leitura de estratégia, num relance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        {/* Signature element */}
        <Card className="flex flex-col items-center justify-center gap-2 p-6">
          <CardDescription>Social Score</CardDescription>
          <SocialScoreDial score={null} size={168} />
          {!hasConnectedAccounts && (
            <p className="text-center text-xs text-muted-foreground">
              Liga uma conta para calcularmos o teu score
            </p>
          )}
        </Card>

        <div className="grid grid-cols-2 gap-4">
          {METRIC_CARDS.map((m) => (
            <Card key={m.label}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="font-mono text-2xl font-semibold">—</p>
                </div>
                <m.icon className="size-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {!hasConnectedAccounts && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="font-display text-sm font-semibold">
                Liga a tua primeira conta social
              </p>
              <p className="text-sm text-muted-foreground">
                Sem uma conta ligada não há dados para analisar. Isto é o
                próximo passo antes de gerares a tua primeira estratégia.
              </p>
            </div>
            <TrendingUp className="size-8 shrink-0 text-primary" />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Content Gaps</CardTitle>
            <CardDescription>
              O que falta na tua mistura de conteúdo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={ListChecks}
              title="Ainda sem análise"
              description="Assim que ligares uma conta e tivermos publicações para ler, mostramos aqui o que está a mais e o que falta."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recomendações da IA</CardTitle>
            <CardDescription>Próximas ações sugeridas</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={Sparkles}
              title="Nada para recomendar ainda"
              description="As recomendações aparecem depois da primeira análise à tua conta."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conteúdo de hoje</CardTitle>
            <CardDescription>O que está agendado para hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={FileEdit}
              title="Nada agendado"
              description="Cria uma ideia de conteúdo e agenda-a no calendário."
              actionLabel="Ir para Ideias"
              actionHref="/dashboard/ideas"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Oportunidades</CardTitle>
            <CardDescription>Formatos e temas por explorar</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={Compass}
              title="Ainda sem oportunidades identificadas"
              description="Precisamos de dados de pelo menos uma conta e alguns concorrentes para começar a sugerir."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
