import { redirect } from "next/navigation"
import { Share2, AlertCircle, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/dashboard/empty-state"

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>
}) {
  const { connected, error } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: accounts } = await supabase
    .from("social_accounts")
    .select("id, platform, username, display_name, status, connected_at")
    .order("connected_at", { ascending: false })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Contas Sociais</h1>
        <p className="text-sm text-muted-foreground">
          Liga as tuas redes para começarmos a analisar.
        </p>
      </div>

      {connected && (
        <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
          <CheckCircle2 className="size-4" />
          Conta ligada com sucesso.
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4" />
          Não foi possível ligar a conta ({error}).
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Instagram / Facebook</CardTitle>
          <CardDescription>
            Via Meta — requer uma conta Instagram Business ou Creator ligada
            a uma Página do Facebook.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a href="/api/social/meta/connect">
            <Button>
              <Share2 className="size-4" />
              Ligar conta Meta
            </Button>
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contas ligadas</CardTitle>
        </CardHeader>
        <CardContent>
          {accounts?.length ? (
            <ul className="space-y-2">
              {accounts.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-md border border-border px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {a.display_name ?? a.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {a.platform} · @{a.username}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{a.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Share2}
              title="Nenhuma conta ligada"
              description="Liga a tua primeira conta acima para começarmos a puxar dados."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
