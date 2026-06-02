import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { Clock, Users, CalendarCheck, Receipt, TrendingUp, AlertCircle } from "lucide-react"

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  const isPartner = session.role === "PARTNER"
  const isFinance = session.role === "FINANCE"
  const isAdmin = session.role === "ADMIN"

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat Datang, {session.name.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {!isAdmin && !isFinance && (
          <StatCard
            title="Billable Hours Bulan Ini"
            value="87.5j"
            subtitle={`Target: ${session.targetBillableHoursMonthly}j`}
            icon={Clock}
            color="amber"
            progress={87.5 / session.targetBillableHoursMonthly * 100}
          />
        )}

        {(isPartner || isAdmin) && (
          <StatCard
            title="Karyawan Aktif"
            value="24"
            subtitle="4 pengajuan cuti pending"
            icon={Users}
            color="blue"
          />
        )}

        <StatCard
          title="Kehadiran Hari Ini"
          value="Check In"
          subtitle="Belum check-in hari ini"
          icon={CalendarCheck}
          color="green"
          action
        />

        {(isPartner || isFinance) && (
          <StatCard
            title="Invoice Outstanding"
            value="Rp 450jt"
            subtitle="5 invoice overdue"
            icon={Receipt}
            color="red"
          />
        )}

        {!isAdmin && !isFinance && (
          <StatCard
            title="Performa Tim"
            value="78%"
            subtitle="Rata-rata utilisasi tim"
            icon={TrendingUp}
            color="purple"
          />
        )}
      </div>

      {/* Pending Approvals (Partner only) */}
      {isPartner && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={20} className="text-amber-500" />
            <h2 className="font-semibold text-gray-800">Menunggu Persetujuan Anda</h2>
          </div>
          <div className="space-y-3">
            <ApprovalItem
              type="Billable Hours"
              from="Reza Firmansyah"
              detail="Matter: PT Mowilex — 3.5 jam, 28 Mei 2026"
            />
            <ApprovalItem
              type="Cuti Tahunan"
              from="Siti Rahayu"
              detail="5–7 Juni 2026 (3 hari)"
            />
            <ApprovalItem
              type="Reimbursement"
              from="Andi Saputra"
              detail="Transport ke PN Jakarta Pusat — Rp 150.000"
            />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {!isAdmin && !isFinance && (
            <QuickAction href="/timesheet" label="+ Tambah Jam Kerja" color="amber" />
          )}
          <QuickAction href="/attendance" label="Check In Sekarang" color="green" />
          {!isAdmin && !isFinance && (
            <QuickAction href="/finance/reimbursement/new" label="Ajukan Reimburse" color="blue" />
          )}
          <QuickAction href="/kms" label="Cari Template" color="purple" />
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  progress,
  action,
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ElementType
  color: "amber" | "blue" | "green" | "red" | "purple"
  progress?: number
  action?: boolean
}) {
  const colors = {
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
  }
  const barColors = {
    amber: "bg-amber-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      {progress !== undefined && (
        <div className="mt-3">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${barColors[color]} rounded-full`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{Math.round(progress)}% dari target</p>
        </div>
      )}
      {action && (
        <a
          href="/attendance"
          className={`mt-3 inline-block text-xs font-medium ${colors[color]} px-3 py-1 rounded-full`}
        >
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
        <button className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-full font-medium transition">
          Setuju
        </button>
        <button className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-full font-medium transition">
          Tolak
        </button>
      </div>
    </div>
  )
}

function QuickAction({ href, label, color }: { href: string; label: string; color: string }) {
  const colors: Record<string, string> = {
    amber: "bg-amber-500 hover:bg-amber-600",
    green: "bg-green-500 hover:bg-green-600",
    blue: "bg-blue-500 hover:bg-blue-600",
    purple: "bg-purple-500 hover:bg-purple-600",
  }
  return (
    <a
      href={href}
      className={`${colors[color]} text-white text-sm font-medium py-2.5 px-4 rounded-lg text-center transition`}
    >
      {label}
    </a>
  )
}
