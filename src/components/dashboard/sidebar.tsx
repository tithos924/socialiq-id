import Link from "next/link"
import {
  LayoutDashboard,
  BarChart3,
  Target,
  CalendarDays,
  Sparkles,
  Lightbulb,
  Users,
  Share2,
  FileText,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/strategy", label: "Estratégia", icon: Target },
  { href: "/dashboard/calendar", label: "Calendário", icon: CalendarDays },
  { href: "/dashboard/studio", label: "AI Content Studio", icon: Sparkles },
  { href: "/dashboard/ideas", label: "Ideias", icon: Lightbulb },
  { href: "/dashboard/competitors", label: "Concorrentes", icon: Users },
  { href: "/dashboard/accounts", label: "Contas Sociais", icon: Share2 },
  { href: "/dashboard/reports", label: "Relatórios", icon: FileText },
  { href: "/dashboard/settings", label: "Definições", icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-16 items-center gap-2 px-6">
        <span className="font-display text-lg font-semibold tracking-tight">
          SocialIQ<span className="text-sidebar-accent">AI</span>
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-muted transition-colors",
              "hover:bg-white/5 hover:text-sidebar-foreground"
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-6 py-4 text-xs text-sidebar-muted">
        ANALYZE → DIAGNOSE → STRATEGIZE
      </div>
    </aside>
  )
}
