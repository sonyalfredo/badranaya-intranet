"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Clock,
  Users,
  CalendarDays,
  Receipt,
  BookOpen,
  FileText,
  Settings,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles: string[]
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["PARTNER", "ASSOCIATE", "PARALEGAL", "FINANCE", "ADMIN"] },
  { label: "Billable Hours", href: "/timesheet", icon: Clock, roles: ["PARTNER", "ASSOCIATE", "PARALEGAL"] },
  { label: "Klien & Matter", href: "/clients", icon: Users, roles: ["PARTNER", "ASSOCIATE", "PARALEGAL", "FINANCE"] },
  { label: "Kehadiran", href: "/attendance", icon: CalendarDays, roles: ["PARTNER", "ASSOCIATE", "PARALEGAL", "FINANCE", "ADMIN"] },
  { label: "Keuangan", href: "/finance", icon: Receipt, roles: ["PARTNER", "FINANCE"] },
  { label: "Knowledge Base", href: "/kms", icon: BookOpen, roles: ["PARTNER", "ASSOCIATE", "PARALEGAL"] },
  { label: "Laporan", href: "/reports", icon: FileText, roles: ["PARTNER", "ADMIN", "FINANCE"] },
  { label: "Admin", href: "/admin", icon: Settings, roles: ["ADMIN", "PARTNER"] },
]

interface SidebarProps {
  userRole: string
  userName: string
  userPosition?: string
}

export default function Sidebar({ userRole, userName, userPosition }: SidebarProps) {
  const pathname = usePathname()

  const visibleItems = navItems.filter((item) => item.roles.includes(userRole))

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/login"
  }

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">BP</span>
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">Badranaya</p>
            <p className="text-slate-400 text-xs">Partnership</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold">{userName.charAt(0)}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-slate-400 text-xs">{userPosition ?? userRole}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-amber-500 text-white font-medium"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors w-full"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </aside>
  )
}
