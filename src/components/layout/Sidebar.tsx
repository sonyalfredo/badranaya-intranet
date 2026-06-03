"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  LayoutDashboard, Clock, Users, CalendarDays,
  Receipt, BookOpen, FileText, Settings, LogOut, ShieldAlert, Hash, Calculator, UserCircle,
} from "lucide-react"
import { cn, getRoleLabel } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles: string[]
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["PARTNER", "ASSOCIATE", "PARALEGAL", "FINANCE", "ADMIN"] },
  { label: "Billable Hours", href: "/timesheet", icon: Clock, roles: ["PARTNER", "ASSOCIATE", "PARALEGAL"] },
  { label: "Clients & Matters", href: "/clients", icon: Users, roles: ["PARTNER", "ASSOCIATE", "PARALEGAL", "FINANCE"] },
  { label: "Attendance", href: "/attendance", icon: CalendarDays, roles: ["PARTNER", "ASSOCIATE", "PARALEGAL", "FINANCE", "ADMIN"] },
  { label: "Finance", href: "/finance", icon: Receipt, roles: ["PARTNER", "ASSOCIATE", "PARALEGAL", "FINANCE"] },
  { label: "Billing", href: "/billing", icon: Calculator, roles: ["PARTNER", "FINANCE"] },
  { label: "Knowledge Base", href: "/kms", icon: BookOpen, roles: ["PARTNER", "ASSOCIATE", "PARALEGAL"] },
  { label: "Document Numbers", href: "/documents", icon: Hash, roles: ["PARTNER", "ASSOCIATE", "PARALEGAL", "ADMIN"] },
  { label: "Reports", href: "/reports", icon: FileText, roles: ["PARTNER", "ADMIN", "FINANCE"] },
  { label: "Admin", href: "/admin", icon: Settings, roles: ["ADMIN", "PARTNER"] },
  { label: "Security Logs", href: "/admin/security", icon: ShieldAlert, roles: ["PARTNER"] },
  { label: "My Profile", href: "/profile", icon: UserCircle, roles: ["PARTNER", "ASSOCIATE", "PARALEGAL", "FINANCE", "ADMIN"] },
]

const ROLE_BADGE: Record<string, string> = {
  PARTNER: "bg-yellow-500/20 text-yellow-400",
  ASSOCIATE: "bg-blue-500/20 text-blue-400",
  PARALEGAL: "bg-purple-500/20 text-purple-400",
  FINANCE: "bg-green-500/20 text-green-400",
  ADMIN: "bg-gray-500/20 text-gray-400",
}

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

  const initials = userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <aside className="w-64 flex flex-col min-h-screen bg-[#0f0f1a] border-r border-white/5">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white flex items-center justify-center flex-shrink-0 shadow-lg">
            <Image
              src="/badranaya-logo.png"
              alt="Badranaya Partnership"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">Badranaya</p>
            <p className="text-[11px] text-white/40 tracking-wide uppercase">Partnership</p>
          </div>
        </div>
      </div>

      {/* User Card */}
      <div className="mx-3 my-3 p-3 rounded-xl bg-white/5 border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-yellow-500 flex items-center justify-center flex-shrink-0 shadow">
            <span className="text-xs font-bold text-yellow-950">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">{userName}</p>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${ROLE_BADGE[userRole]}`}>
              {userPosition ?? getRoleLabel(userRole)}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        <p className="text-[10px] text-white/25 uppercase tracking-widest px-3 pb-2 pt-1">Navigation</p>
        {visibleItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-yellow-500 text-yellow-950 shadow-lg shadow-yellow-500/20"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={17} className={active ? "text-yellow-950" : "text-white/40 group-hover:text-white"} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Sign Out */}
      <div className="px-3 py-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-all w-full"
        >
          <LogOut size={17} className="group-hover:text-red-400" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
