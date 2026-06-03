"use client"

import { useState } from "react"
import { Shield, AlertTriangle, LogIn, LogOut, Ban, Search, RefreshCw, Download } from "lucide-react"

interface AuditLog {
  id: string
  userId?: string | null
  userEmail?: string | null
  userName?: string | null
  userRole?: string | null
  action: string
  resource: string
  resourceId?: string | null
  detail?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  success: boolean
  createdAt: Date
}

interface Stats {
  totalLogins: number
  failedLogins: number
  blockedAttempts: number
  activeToday: number
}

const ACTION_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  LOGIN: { label: "Login", color: "bg-green-100 text-green-700", icon: LogIn },
  LOGOUT: { label: "Logout", color: "bg-gray-100 text-gray-600", icon: LogOut },
  LOGIN_FAILED: { label: "Failed Login", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  VIEW: { label: "View", color: "bg-blue-100 text-blue-700", icon: Shield },
  CREATE: { label: "Create", color: "bg-purple-100 text-purple-700", icon: Shield },
  UPDATE: { label: "Update", color: "bg-yellow-100 text-yellow-700", icon: Shield },
  DELETE: { label: "Delete", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  EXPORT: { label: "Export", color: "bg-orange-100 text-orange-700", icon: Download },
  DOWNLOAD: { label: "Download", color: "bg-orange-100 text-orange-700", icon: Download },
}

export default function SecurityClient({ logs, stats }: { logs: AuditLog[]; stats: Stats }) {
  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState("")
  const [showFailed, setShowFailed] = useState(false)

  const filtered = logs.filter((log) => {
    const matchSearch = !search ||
      (log.userName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (log.userEmail ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (log.ipAddress ?? "").includes(search) ||
      (log.detail ?? "").toLowerCase().includes(search.toLowerCase())
    const matchAction = !actionFilter || log.action === actionFilter
    const matchFailed = !showFailed || !log.success
    return matchSearch && matchAction && matchFailed
  })

  function formatTime(date: Date) {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Logs</h1>
          <p className="text-gray-500 text-sm mt-0.5">All system activity — access restricted to Partners</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl transition"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={LogIn} label="Total Logins" value={stats.totalLogins} color="green" />
        <StatCard icon={Shield} label="Active Today" value={stats.activeToday} color="blue" />
        <StatCard icon={AlertTriangle} label="Failed Attempts" value={stats.failedLogins} color="yellow" />
        <StatCard icon={Ban} label="Blocked" value={stats.blockedAttempts} color="red" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, IP, or detail..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50 bg-white"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
        >
          <option value="">All Actions</option>
          {Object.entries(ACTION_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <button
          onClick={() => setShowFailed(!showFailed)}
          className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition ${showFailed ? "bg-red-500 text-white border-red-500" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
        >
          <AlertTriangle size={14} />
          {showFailed ? "Showing Failed Only" : "Show Failed Only"}
        </button>
      </div>

      {/* Log count */}
      <p className="text-xs text-gray-400 mb-3">{filtered.length} entries shown</p>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                <th className="px-5 py-3 text-left">Time</th>
                <th className="px-5 py-3 text-left">Action</th>
                <th className="px-5 py-3 text-left">User</th>
                <th className="px-5 py-3 text-left">IP Address</th>
                <th className="px-5 py-3 text-left">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm">
                    No logs found
                  </td>
                </tr>
              )}
              {filtered.map((log) => {
                const cfg = ACTION_CONFIG[log.action] ?? { label: log.action, color: "bg-gray-100 text-gray-600", icon: Shield }
                const Icon = cfg.icon
                const isAlert = !log.success || log.action === "LOGIN_FAILED"
                return (
                  <tr key={log.id} className={`hover:bg-gray-50/50 transition-colors ${isAlert ? "bg-red-50/30" : ""}`}>
                    <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap font-mono">
                      {formatTime(log.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
                        <Icon size={11} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {log.userName ? (
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{log.userName}</p>
                          <p className="text-xs text-gray-400">{log.userEmail}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">{log.userEmail ?? "—"}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs font-mono text-gray-500">
                      {log.ipAddress ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500 max-w-[280px]">
                      <p className="truncate">{log.detail ?? "—"}</p>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number; color: string
}) {
  const colors: Record<string, string> = {
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className={`inline-flex p-2 rounded-xl mb-3 ${colors[color]}`}>
        <Icon size={16} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}
