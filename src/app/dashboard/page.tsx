import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { logout } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // RLS-scoped read: this only ever returns organizations the current
  // user is a member of — never another tenant's data.
  const { data: memberships, error } = await supabase
    .from("organization_members")
    .select("role, organizations(id, name, plan)")
    .eq("user_id", user.id)

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <form action={logout}>
          <Button type="submit" variant="outline" size="sm">
            Sair
          </Button>
        </form>
      </div>

      <p className="text-sm text-muted-foreground">Sessão iniciada como {user.email}</p>

      <div className="rounded-lg border p-4">
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">
          As tuas organizações
        </h2>
        {error && (
          <p className="text-sm text-destructive">{error.message}</p>
        )}
        {memberships?.length ? (
          <ul className="space-y-1">
            {memberships.map((m, i) => {
              const org = Array.isArray(m.organizations)
                ? m.organizations[0]
                : m.organizations
              return (
                <li key={i} className="text-sm">
                  {org?.name}{" "}
                  <span className="text-muted-foreground">
                    ({m.role} · plano {org?.plan})
                  </span>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma organização encontrada.</p>
        )}
      </div>
    </div>
  )
}
