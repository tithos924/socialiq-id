import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/dashboard/sidebar"
import { TopBar } from "@/components/dashboard/top-bar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organizations(name)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle()

  const org = Array.isArray(membership?.organizations)
    ? membership?.organizations[0]
    : membership?.organizations

  return (
    <div className="flex min-h-svh">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopBar
          organizationName={org?.name ?? "A tua organização"}
          userEmail={user.email ?? ""}
        />
        <main className="flex-1 bg-secondary/40 p-6">{children}</main>
      </div>
    </div>
  )
}
