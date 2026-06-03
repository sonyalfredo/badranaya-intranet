"use client"

import { useState, useEffect, useRef } from "react"
import { Clock, Play, Square, Plus, Check, X } from "lucide-react"
import { formatHours } from "@/lib/utils"
import type { SessionUser } from "@/lib/session"

interface TimeEntry {
  id: string
  date: string
  matter: string
  matterCode: string
  hours: number
  type: "BILLABLE" | "NON_BILLABLE"
  description: string
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED"
}

const MOCK_MATTERS: { id: string; matterCode: string; matterName: string; clientName: string }[] = []

const MOCK_ENTRIES: TimeEntry[] = []

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Pending Approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SUBMITTED: "bg-blue-100 text-blue-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
}

export default function TimesheetClient({ session }: { session: SessionUser }) {
  const [entries, setEntries] = useState<TimeEntry[]>(MOCK_ENTRIES)
  const [showForm, setShowForm] = useState(false)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerMatter, setTimerMatter] = useState("")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const [form, setForm] = useState({
    matterId: "",
    date: new Date().toISOString().split("T")[0],
    hours: "",
    type: "BILLABLE" as "BILLABLE" | "NON_BILLABLE",
    description: "",
  })

  const totalBillableMonth = 87.5
  const targetHours = session.targetBillableHoursMonthly
  const progress = (totalBillableMonth / targetHours) * 100

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => setTimerSeconds((s) => s + 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [timerRunning])

  function formatTimer(seconds: number) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  function stopTimer() {
    setTimerRunning(false)
    const hours = parseFloat((timerSeconds / 3600).toFixed(2))
    setForm((f) => ({ ...f, hours: String(hours) }))
    setShowForm(true)
    setTimerSeconds(0)
  }

  function handleSubmitEntry(status: "DRAFT" | "SUBMITTED") {
    const matter = MOCK_MATTERS.find((m) => m.id === form.matterId)
    if (!matter || !form.hours || !form.description) return
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      date: form.date,
      matter: matter.matterName,
      matterCode: matter.matterCode,
      hours: parseFloat(form.hours),
      type: form.type,
      description: form.description,
      status,
    }
    setEntries((prev) => [newEntry, ...prev])
    setShowForm(false)
    setForm({ matterId: "", date: new Date().toISOString().split("T")[0], hours: "", type: "BILLABLE", description: "" })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billable Hours</h1>
          <p className="text-gray-500 text-sm mt-0.5">Log and manage your working hours</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-yellow-950 text-sm font-semibold px-4 py-2 rounded-xl transition shadow-sm">
          <Plus size={16} /> Add Entry
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Monthly Progress */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">Monthly Progress</h2>
            <span className="text-sm text-gray-400">June 2026</span>
          </div>
          <div className="flex items-end gap-3 mb-3">
            <span className="text-3xl font-bold text-gray-900">{formatHours(totalBillableMonth)}</span>
            <span className="text-gray-400 text-sm mb-1">of {formatHours(targetHours)} target</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-400">{Math.round(progress)}% achieved</span>
            <span className="text-xs text-gray-400">{formatHours(targetHours - totalBillableMonth)} remaining</span>
          </div>
        </div>

        {/* Stopwatch */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Stopwatch</h2>
          {!timerRunning && timerSeconds === 0 && (
            <div className="mb-3">
              <select value={timerMatter}
                onChange={(e) => { setTimerMatter(e.target.value); setForm((f) => ({ ...f, matterId: e.target.value })) }}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 bg-gray-50">
                <option value="">Select matter...</option>
                {MOCK_MATTERS.map((m) => <option key={m.id} value={m.id}>{m.matterCode} — {m.matterName}</option>)}
              </select>
            </div>
          )}
          <div className="text-center my-2">
            <p className="text-3xl font-mono font-bold text-gray-900">{formatTimer(timerSeconds)}</p>
            {timerRunning && timerMatter && (
              <p className="text-xs text-gray-400 mt-1">{MOCK_MATTERS.find((m) => m.id === timerMatter)?.matterCode}</p>
            )}
          </div>
          <div className="flex gap-2 mt-3">
            {!timerRunning ? (
              <button onClick={() => timerMatter && setTimerRunning(true)} disabled={!timerMatter}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-100 disabled:text-gray-400 text-white text-sm font-semibold py-2 rounded-xl transition">
                <Play size={14} /> Start
              </button>
            ) : (
              <button onClick={stopTimer}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 rounded-xl transition">
                <Square size={14} /> Stop & Save
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Entry Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-yellow-200 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">New Time Entry</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Matter *</label>
              <select value={form.matterId} onChange={(e) => setForm((f) => ({ ...f, matterId: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 bg-gray-50">
                <option value="">Select matter...</option>
                {MOCK_MATTERS.map((m) => <option key={m.id} value={m.id}>{m.matterCode} — {m.matterName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Date *</label>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 bg-gray-50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Duration (hours) *</label>
              <input type="number" step="0.25" min="0.25" max="24" value={form.hours}
                onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
                placeholder="e.g. 2.5"
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 bg-gray-50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Type</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "BILLABLE" | "NON_BILLABLE" }))}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 bg-gray-50">
                <option value="BILLABLE">Billable</option>
                <option value="NON_BILLABLE">Non-Billable</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Work Description *</label>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3} placeholder="Describe the work performed in detail..."
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 bg-gray-50 resize-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => handleSubmitEntry("DRAFT")}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl transition">
              Save as Draft
            </button>
            <button onClick={() => handleSubmitEntry("SUBMITTED")}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-yellow-950 text-sm font-semibold px-4 py-2 rounded-xl transition shadow-sm">
              <Check size={16} /> Submit for Approval
            </button>
          </div>
        </div>
      )}

      {/* Entries Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Time Entry History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-left">Matter</th>
                <th className="px-5 py-3 text-left">Description</th>
                <th className="px-5 py-3 text-center">Hours</th>
                <th className="px-5 py-3 text-center">Type</th>
                <th className="px-5 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(entry.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800 truncate max-w-[180px]">{entry.matter}</p>
                    <p className="text-xs text-gray-400 font-mono">{entry.matterCode}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-500 max-w-[220px]">
                    <p className="truncate">{entry.description}</p>
                  </td>
                  <td className="px-5 py-3 text-center font-semibold text-gray-800">{formatHours(entry.hours)}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${entry.type === "BILLABLE" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>
                      {entry.type === "BILLABLE" ? "Billable" : "Non-Billable"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[entry.status]}`}>
                      {STATUS_LABELS[entry.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
