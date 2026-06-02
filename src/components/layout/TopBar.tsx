"use client"

import { Bell, Search } from "lucide-react"
import { getRoleLabel } from "@/lib/utils"

interface TopBarProps {
  userName: string
  userRole: string
}

export default function TopBar({ userName, userRole }: TopBarProps) {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  })

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search anything..."
            className="pl-9 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition placeholder:text-gray-400"
          />
        </div>
        <span className="text-xs text-gray-400 hidden md:block">{today}</span>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-gray-500">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
          <div className="w-7 h-7 rounded-lg bg-yellow-500 flex items-center justify-center shadow-sm">
            <span className="text-[10px] font-bold text-yellow-950">
              {userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-gray-700 leading-tight">{userName}</p>
            <p className="text-[10px] text-gray-400">{getRoleLabel(userRole)}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
