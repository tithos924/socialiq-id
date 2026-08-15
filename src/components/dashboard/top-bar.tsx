import { logout } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"

interface TopBarProps {
  organizationName: string
  userEmail: string
}

export function TopBar({ organizationName, userEmail }: TopBarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-6">
      <div>
        <p className="text-sm font-medium">{organizationName}</p>
        <p className="text-xs text-muted-foreground">{userEmail}</p>
      </div>
      <form action={logout}>
        <Button type="submit" variant="outline" size="sm">
          Sair
        </Button>
      </form>
    </header>
  )
}
