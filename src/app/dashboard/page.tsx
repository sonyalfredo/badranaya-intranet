import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { Clock, Users, CalendarCheck, Receipt, TrendingUp, AlertCircle } from "lucide-react"

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  const isPartner = session.role === "PARTNER"
  const isFinance = session.role === "FINANCE"
  const isAdmin = session.role === "ADMIN"

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session.name.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">{today}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {!isAdmin && !isFinance && (
          <StatCard
            title="Billable Hours This Month"
            value="87.5h"
            subtitle={`Target: ${session.targetBillableHoursMonthly}h`}
            icon={Clock}
            color="amber"
            progress={87.5 / session.targetBillableHoursMonthly * 100}
          />
        )}
        {(isPartner || isAdmin) && (
          <StatCard title="Active Employees" value="24" subtitle="4 leave requests pending" icon={Users} color="blue" />
        )}
        <StatCard title="Attendance" value="Check In" subtitle="You haven't checked in today" icon={CalendarCheck} color="green" action />
        {(isPartner || isFinance) && (
          <StatCard title="Outstanding Invoices" value="Rp 450M" subtitle="5 invoices overdue" icon={Receipt} color="red" />
        )}
        {!isAdmin && !isFinance && (
          <StatCard title="Team Performance" value="78%" subtitle="Average team utilisation" icon={TrendingUp} color="purple" />
        )}
      </div>

      {isPartner && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={20} className="text-amber-500" />
            <h2 className="font-semibold text-gray-800">Pending Your Approval</h2>
          </div>
          <div className="space-y-3">
            <ApprovalItem type="Billable Hours" from="Reza Firmansyah" detail="Matter: PT Mowilex — 3.5h, 28 May 2026" />
            <ApprovalItem type="Annual Leave" from="Siti Rahayu" detail="5–7 June 2026 (3 days)" />
            <ApprovalItem type="Reimbursement" from="Andi Saputra" detail="Transport to PN Jakarta Pusat — Rp 150,000" />
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {!isAdmin && !isFinance && <QuickAction href="/timesheet" label="+ Log Time" color="amber" />}
          <QuickAction href="/attendance" label="Check In Now" color="green" />
          {!isAdmin && !isFinance && <QuickAction href="/finance" label="Submit Expense" color="blue" />}
          <QuickAction href="/kms" label="Search Templates" color="purple" />
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle, icon: Icon, color, progress, action }: {
  title: string; value: string; subtitle: string; icon: React.ElementType
  color: "amber" | "blue" | "green" | "red" | "purple"; progress?: number; action?: boolean
}) {
  const colors = { amber: "bg-amber-50 text-amber-600", blue: "bg-blue-50 text-blue-600", green: "bg-green-50 text-green-600", red: "bg-red-50 text-red-600", purple: "bg-purple-50 text-purple-600" }
  const barColors = { amber: "bg-amber-500", blue: "bg-blue-500", green: "bg-green-500", red: "bg-red-500", purple: "bg-purple-500" }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}><Icon size={18} /></div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      {progress !== undefined && (
        <div className="mt-3">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full ${barColors[color]} rounded-full`} style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">{Math.round(progress)}% of target</p>
        </div>
      )}
      {action && (
        <a href="/attendance" className={`mt-3 inline-block text-xs font-medium ${colors[color]} px-3 py-1 rounded-full`}>
          Check In →
        </a>
      )}
    </div>
  )
}

function ApprovalItem({ type, from, detail }: { type: string; from: string; detail: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800">{type} — {from}</p>
        <p className="text-xs text-gray-500 mt-0.5">{detail}</p>
      </div>
      <div className="flex gap-2 ml-4">
        <button className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-full font-medium transition">Approve</button>
        <button className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-full font-medium transition">Reject</button>
      </div>
    </div>
  )
}

function QuickAction({ href, label, color }: { href: string; label: string; color: string }) {
  const colors: Record<string, string> = { amber: "bg-amber-500 hover:bg-amber-600", green: "bg-green-500 hover:bg-green-600", blue: "bg-blue-500 hover:bg-blue-600", purple: "bg-purple-500 hover:bg-purple-600" }
  return (
    <a href={href} className={`${colors[color]} text-white text-sm font-medium py-2.5 px-4 rounded-lg text-center transition`}>
      {label}
    </a>
  )
}
