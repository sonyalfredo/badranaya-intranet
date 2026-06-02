"use client"

import { useState, useEffect } from "react"
import { MapPin, Clock, LogIn, LogOut, Plus, X, Check, CalendarDays } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import type { SessionUser } from "@/lib/session"

interface AttendanceRecord {
  id: string
  date: string
  checkInAt?: string
  checkOutAt?: string
  ipAddress?: string
  type: string
  notes?: string
}

interface LeaveRequest {
  id: string
  type: string
  startDate: string
  endDate: string
  reason: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  submittedAt: string
  user?: { name: string; position?: string }
  approver?: { name: string }
}

const TYPE_LABELS: Record<string, string> = {
  WFO: "Work From Office",
  WFH: "Work From Home",
  COURT: "Sidang / Pengadilan",
  CLIENT_VISIT: "Kunjungan Klien",
  LEAVE: "Cuti / Izin",
}

const LEAVE_TYPE_LABELS: Record<string, string> = {
  ANNUAL: "Cuti Tahunan",
  SICK: "Sakit",
  OFFICIAL_DUTY: "Dinas Luar",
  OTHER: "Lainnya",
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
}

const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: "1", date: "2026-06-02", checkInAt: "2026-06-02T08:02:00", checkOutAt: "2026-06-02T17:45:00", ipAddress: "192.168.1.10", type: "WFO" },
  { id: "2", date: "2026-06-01", checkInAt: "2026-06-01T08:15:00", checkOutAt: "2026-06-01T18:30:00", ipAddress: "192.168.1.10", type: "WFO" },
  { id: "3", date: "2026-05-31", checkInAt: "2026-05-31T09:00:00", type: "COURT", notes: "Sidang PT Mowilex PN Jakarta Pusat" },
  { id: "4", date: "2026-05-30", type: "LEAVE" },
]

const MOCK_LEAVES: LeaveRequest[] = [
  { id: "1", type: "ANNUAL", startDate: "2026-05-30", endDate: "2026-05-30", reason: "Keperluan keluarga", status: "APPROVED", submittedAt: "2026-05-28T10:00:00" },
  { id: "2", type: "OFFICIAL_DUTY", startDate: "2026-06-10", endDate: "2026-06-11", reason: "Sidang di PN Surabaya — Perkara BP-2026-003", status: "PENDING", submittedAt: "2026-06-02T09:00:00" },
]

export default function AttendanceClient({ session }: { session: SessionUser }) {
  const [tab, setTab] = useState<"attendance" | "leave">("attendance")
  const [todayStatus, setTodayStatus] = useState<"none" | "checkedin" | "done">("none")
  const [checkInTime, setCheckInTime] = useState<string | null>(null)
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null)
  const [attendanceType, setAttendanceType] = useState("WFO")
  const [loading, setLoading] = useState(false)
  const [showLeaveForm, setShowLeaveForm] = useState(false)
  const [leaveForm, setLeaveForm] = useState({ type: "ANNUAL", startDate: "", endDate: "", reason: "" })
  const [leaves, setLeaves] = useState<LeaveRequest[]>(MOCK_LEAVES)
  const [currentTime, setCurrentTime] = useState(new Date())

  const isManager = session.role === "PARTNER" || session.role === "ADMIN"

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  async function handleCheckIn() {
    setLoading(true)
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkin", type: attendanceType }),
      })
      if (res.ok) {
        setTodayStatus("checkedin")
        setCheckInTime(new Date().toISOString())
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCheckOut() {
    setLoading(true)
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkout" }),
      })
      if (res.ok) {
        setTodayStatus("done")
        setCheckOutTime(new Date().toISOString())
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleLeaveSubmit() {
    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) return
    const res = await fetch("/api/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leaveForm),
    })
    if (res.ok) {
      const newLeave = await res.json()
      setLeaves((prev) => [{ ...newLeave, status: "PENDING" }, ...prev])
      setShowLeaveForm(false)
      setLeaveForm({ type: "ANNUAL", startDate: "", endDate: "", reason: "" })
    }
  }

  async function handleLeaveAction(id: string, action: "approve" | "reject") {
    const res = await fetch(`/api/leave/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
    if (res.ok) {
      setLeaves((prev) =>
        prev.map((l) => l.id === id ? { ...l, status: action === "approve" ? "APPROVED" : "REJECTED" } : l)
      )
    }
  }

  const totalPresent = MOCK_ATTENDANCE.filter((a) => a.checkInAt && a.type !== "LEAVE").length
  const totalLeave = MOCK_ATTENDANCE.filter((a) => a.type === "LEAVE").length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kehadiran & SDM</h1>
          <p className="text-gray-500 text-sm mt-0.5">Presensi digital dan manajemen cuti</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono font-bold text-gray-800">
            {currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
          <p className="text-xs text-gray-400">
            {currentTime.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Check-in Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Status indicator */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-3 h-3 rounded-full ${todayStatus === "done" ? "bg-green-500" : todayStatus === "checkedin" ? "bg-amber-500 animate-pulse" : "bg-gray-300"}`} />
              <p className="font-semibold text-gray-800">
                {todayStatus === "done" ? "Selesai Bekerja" : todayStatus === "checkedin" ? "Sedang Bekerja" : "Belum Check-In"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 flex items-center gap-1.5"><LogIn size={14} /> Check-In</p>
                <p className="font-semibold text-gray-800 mt-0.5">
                  {checkInTime ? new Date(checkInTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 flex items-center gap-1.5"><LogOut size={14} /> Check-Out</p>
                <p className="font-semibold text-gray-800 mt-0.5">
                  {checkOutTime ? new Date(checkOutTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="flex flex-col gap-3 w-full sm:w-auto">
            {todayStatus === "none" && (
              <>
                <select
                  value={attendanceType}
                  onChange={(e) => setAttendanceType(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {Object.entries(TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <button
                  onClick={handleCheckIn}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold py-2.5 px-6 rounded-lg transition text-sm"
                >
                  <LogIn size={16} /> Check-In Sekarang
                </button>
              </>
            )}
            {todayStatus === "checkedin" && (
              <button
                onClick={handleCheckOut}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-semibold py-2.5 px-6 rounded-lg transition text-sm"
              >
                <LogOut size={16} /> Check-Out
              </button>
            )}
            {todayStatus === "done" && (
              <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                <Check size={18} /> Kehadiran Hari Ini Tercatat
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <MapPin size={12} /> IP dicatat otomatis
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{totalPresent}</p>
          <p className="text-xs text-gray-500 mt-0.5">Hari Hadir</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{totalLeave}</p>
          <p className="text-xs text-gray-500 mt-0.5">Hari Cuti/Izin</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">12</p>
          <p className="text-xs text-gray-500 mt-0.5">Sisa Cuti Tahunan</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab("attendance")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${tab === "attendance" ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"}`}
        >
          Riwayat Kehadiran
        </button>
        <button
          onClick={() => setTab("leave")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${tab === "leave" ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"}`}
        >
          Cuti & Izin
        </button>
      </div>

      {/* Attendance History */}
      {tab === "attendance" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Rekap Juni 2026</h2>
            <button className="text-xs text-amber-600 hover:text-amber-700 font-medium">Export PDF →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">Tanggal</th>
                  <th className="px-5 py-3 text-left">Tipe</th>
                  <th className="px-5 py-3 text-center">Check-In</th>
                  <th className="px-5 py-3 text-center">Check-Out</th>
                  <th className="px-5 py-3 text-center">Durasi</th>
                  <th className="px-5 py-3 text-left">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MOCK_ATTENDANCE.map((rec) => {
                  const duration =
                    rec.checkInAt && rec.checkOutAt
                      ? Math.round((new Date(rec.checkOutAt).getTime() - new Date(rec.checkInAt).getTime()) / 3600000 * 10) / 10
                      : null
                  return (
                    <tr key={rec.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-gray-700 whitespace-nowrap">
                        {new Date(rec.date).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${rec.type === "WFO" ? "bg-blue-100 text-blue-700" : rec.type === "LEAVE" ? "bg-gray-100 text-gray-600" : "bg-purple-100 text-purple-700"}`}>
                          {TYPE_LABELS[rec.type]}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center text-gray-700">
                        {rec.checkInAt ? new Date(rec.checkInAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="px-5 py-3 text-center text-gray-700">
                        {rec.checkOutAt ? new Date(rec.checkOutAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="px-5 py-3 text-center font-medium text-gray-800">
                        {duration ? `${duration}j` : "—"}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500">{rec.notes ?? "—"}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leave Requests */}
      {tab === "leave" && (
        <div>
          {showLeaveForm && (
            <div className="bg-white rounded-xl border border-amber-200 p-5 mb-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Ajukan Cuti / Izin</h3>
                <button onClick={() => setShowLeaveForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Jenis</label>
                  <select
                    value={leaveForm.type}
                    onChange={(e) => setLeaveForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {Object.entries(LEAVE_TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div />
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal Mulai</label>
                  <input type="date" value={leaveForm.startDate} onChange={(e) => setLeaveForm((f) => ({ ...f, startDate: e.target.value }))}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal Selesai</label>
                  <input type="date" value={leaveForm.endDate} onChange={(e) => setLeaveForm((f) => ({ ...f, endDate: e.target.value }))}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Alasan / Keterangan</label>
                  <textarea value={leaveForm.reason} onChange={(e) => setLeaveForm((f) => ({ ...f, reason: e.target.value }))}
                    rows={3} placeholder="Jelaskan alasan pengajuan..."
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleLeaveSubmit}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                  <Check size={16} /> Kirim Pengajuan
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">
                {isManager ? "Semua Pengajuan Cuti" : "Pengajuan Cuti Saya"}
              </h2>
              {!isManager && (
                <button onClick={() => setShowLeaveForm(true)}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition">
                  <Plus size={14} /> Ajukan Cuti
                </button>
              )}
            </div>
            <div className="divide-y divide-gray-50">
              {leaves.map((leave) => (
                <div key={leave.id} className="px-5 py-4 flex items-center justify-between">
                  <div>
                    {isManager && leave.user && (
                      <p className="font-medium text-gray-800 text-sm">{leave.user.name}</p>
                    )}
                    <p className={`font-medium text-gray-800 text-sm ${isManager ? "text-gray-600" : ""}`}>
                      {LEAVE_TYPE_LABELS[leave.type]}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(leave.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      {leave.startDate !== leave.endDate && ` — ${new Date(leave.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{leave.reason}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[leave.status]}`}>
                      {leave.status === "PENDING" ? "Menunggu" : leave.status === "APPROVED" ? "Disetujui" : "Ditolak"}
                    </span>
                    {isManager && leave.status === "PENDING" && (
                      <div className="flex gap-2">
                        <button onClick={() => handleLeaveAction(leave.id, "approve")}
                          className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-full font-medium transition">
                          Setuju
                        </button>
                        <button onClick={() => handleLeaveAction(leave.id, "reject")}
                          className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-full font-medium transition">
                          Tolak
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
