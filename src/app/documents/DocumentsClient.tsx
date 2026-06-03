"use client"

import { useState, useEffect } from "react"
import { Plus, X, Copy, Check, Search, FileText, ChevronDown } from "lucide-react"
import type { SessionUser } from "@/lib/session"

interface DocumentNumber {
  id: string
  docType: string
  sequence: number
  year: number
  month: number
  fullNumber: string
  subject: string
  matterId?: string
  matter?: { matterCode: string; matterName: string }
  clientName?: string
  requestedBy: string
  requester: { name: string; position?: string }
  notes?: string
  createdAt: string
}

const DOC_TYPES = [
  { code: "LM",  label: "Legal Memo",              color: "bg-blue-100 text-blue-700" },
  { code: "LO",  label: "Legal Opinion",            color: "bg-purple-100 text-purple-700" },
  { code: "SK",  label: "Surat Keluar",             color: "bg-green-100 text-green-700" },
  { code: "SM",  label: "Surat Masuk",              color: "bg-gray-100 text-gray-700" },
  { code: "SOM", label: "Somasi",                   color: "bg-red-100 text-red-700" },
  { code: "GUG", label: "Gugatan",                  color: "bg-red-100 text-red-800" },
  { code: "PKS", label: "Perjanjian / Kontrak",     color: "bg-yellow-100 text-yellow-700" },
  { code: "SP",  label: "Surat Pernyataan",         color: "bg-orange-100 text-orange-700" },
  { code: "DD",  label: "Due Diligence Report",     color: "bg-indigo-100 text-indigo-700" },
  { code: "FA",  label: "Internal Memo",            color: "bg-slate-100 text-slate-700" },
]

const ROMAN_MONTHS = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"]

export default function DocumentsClient({ session }: { session: SessionUser }) {
  const [documents, setDocuments] = useState<DocumentNumber[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [justCreated, setJustCreated] = useState<DocumentNumber | null>(null)
  const [form, setForm] = useState({
    docType: "LM",
    subject: "",
    clientName: "",
    matterId: "",
    notes: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const year = new Date().getFullYear()

  useEffect(() => {
    fetchDocuments()
  }, [typeFilter])

  async function fetchDocuments() {
    setLoading(true)
    const params = new URLSearchParams({ year: String(year) })
    if (typeFilter) params.set("docType", typeFilter)
    if (search) params.set("search", search)
    const res = await fetch(`/api/documents?${params}`)
    if (res.ok) setDocuments(await res.json())
    setLoading(false)
  }

  async function handleSubmit() {
    if (!form.subject) return
    setSubmitting(true)
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const doc = await res.json()
      setDocuments((prev) => [doc, ...prev])
      setJustCreated(doc)
      setShowForm(false)
      setForm({ docType: "LM", subject: "", clientName: "", matterId: "", notes: "" })
    }
    setSubmitting(false)
  }

  function copyNumber(doc: DocumentNumber) {
    navigator.clipboard.writeText(doc.fullNumber)
    setCopiedId(doc.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filtered = documents.filter((d) => {
    return !search ||
      d.fullNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.subject.toLowerCase().includes(search.toLowerCase()) ||
      (d.clientName ?? "").toLowerCase().includes(search.toLowerCase())
  })

  // Count per type
  const countByType = DOC_TYPES.map((t) => ({
    ...t,
    count: documents.filter((d) => d.docType === t.code).length,
  }))

  const selectedType = DOC_TYPES.find((t) => t.code === form.docType)
  const now = new Date()
  const previewNumber = `${form.docType}/XXX/BP/${ROMAN_MONTHS[now.getMonth()]}/${now.getFullYear()}`

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Numbering</h1>
          <p className="text-gray-500 text-sm mt-0.5">Generate and track official document numbers</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setJustCreated(null) }}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-yellow-950 text-sm font-semibold px-4 py-2 rounded-xl transition shadow-sm"
        >
          <Plus size={16} /> Request Number
        </button>
      </div>

      {/* Just Created Banner */}
      {justCreated && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-800">Document number successfully generated!</p>
            <p className="text-2xl font-bold font-mono text-green-700 mt-1">{justCreated.fullNumber}</p>
            <p className="text-xs text-green-600 mt-0.5">{justCreated.subject}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => copyNumber(justCreated)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition"
            >
              {copiedId === justCreated.id ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy Number</>}
            </button>
            <button onClick={() => setJustCreated(null)} className="text-green-500 hover:text-green-700">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Type Filter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <button
          onClick={() => setTypeFilter("")}
          className={`bg-white rounded-xl border p-3 text-left transition hover:shadow-sm ${!typeFilter ? "border-yellow-400 shadow-sm" : "border-gray-100"}`}
        >
          <p className="text-xl font-bold text-gray-900">{documents.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">All Documents</p>
        </button>
        {countByType.slice(0, 4).map((t) => (
          <button
            key={t.code}
            onClick={() => setTypeFilter(typeFilter === t.code ? "" : t.code)}
            className={`bg-white rounded-xl border p-3 text-left transition hover:shadow-sm ${typeFilter === t.code ? "border-yellow-400 shadow-sm" : "border-gray-100"}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${t.color}`}>{t.code}</span>
              <span className="text-lg font-bold text-gray-900">{t.count}</span>
            </div>
            <p className="text-xs text-gray-500 truncate">{t.label}</p>
          </button>
        ))}
      </div>

      {/* Request Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-yellow-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-800">Request Document Number</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-xl p-4 mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Number preview</p>
              <p className="text-xl font-bold font-mono text-gray-800">{previewNumber}</p>
            </div>
            <div className={`text-xs font-semibold px-3 py-1.5 rounded-full ${selectedType?.color}`}>
              {selectedType?.label}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Document Type *</label>
              <select
                value={form.docType}
                onChange={(e) => setForm((f) => ({ ...f, docType: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
              >
                {DOC_TYPES.map((t) => (
                  <option key={t.code} value={t.code}>{t.code} — {t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Client / Company Name</label>
              <input
                value={form.clientName}
                onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
                placeholder="e.g. PT Mowilex Indonesia"
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Document Subject / Title *</label>
              <input
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder="e.g. Legal Opinion on Share Acquisition of PT Maju Bersama"
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Matter Code (optional)</label>
              <input
                value={form.matterId}
                onChange={(e) => setForm((f) => ({ ...f, matterId: e.target.value }))}
                placeholder="e.g. BP-2026-001"
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Notes (optional)</label>
              <input
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Additional notes..."
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSubmit}
              disabled={submitting || !form.subject}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-yellow-950 text-sm font-bold px-5 py-2.5 rounded-xl transition shadow-sm"
            >
              {submitting ? "Generating..." : "Generate Number"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700 text-sm px-4 py-2.5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchDocuments()}
          placeholder="Search by number, subject, or client..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
        />
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Document Register — {year}</h2>
          <span className="text-xs text-gray-400">{filtered.length} documents</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileText size={36} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">No documents yet</p>
            <p className="text-gray-300 text-xs mt-1">Click "Request Number" to generate the first one</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">Document Number</th>
                  <th className="px-5 py-3 text-left">Subject</th>
                  <th className="px-5 py-3 text-left">Client</th>
                  <th className="px-5 py-3 text-left">Requested By</th>
                  <th className="px-5 py-3 text-center">Date</th>
                  <th className="px-5 py-3 text-center">Copy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((doc) => {
                  const typeConfig = DOC_TYPES.find((t) => t.code === doc.docType)
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeConfig?.color}`}>
                            {doc.docType}
                          </span>
                          <span className="font-mono font-semibold text-gray-800 text-sm">{doc.fullNumber}</span>
                        </div>
                        {doc.matter && (
                          <p className="text-xs text-gray-400 mt-0.5 ml-12 font-mono">{doc.matter.matterCode}</p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-gray-700 max-w-[220px]">
                        <p className="truncate">{doc.subject}</p>
                        {doc.notes && <p className="text-xs text-gray-400 truncate">{doc.notes}</p>}
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-sm">{doc.clientName ?? "—"}</td>
                      <td className="px-5 py-3">
                        <p className="text-gray-700 text-sm">{doc.requester.name}</p>
                        <p className="text-xs text-gray-400">{doc.requester.position}</p>
                      </td>
                      <td className="px-5 py-3 text-center text-xs text-gray-500 whitespace-nowrap">
                        {new Date(doc.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => copyNumber(doc)}
                          className={`flex items-center gap-1.5 mx-auto text-xs font-medium px-3 py-1.5 rounded-lg transition ${
                            copiedId === doc.id
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 hover:bg-yellow-100 hover:text-yellow-800 text-gray-600"
                          }`}
                        >
                          {copiedId === doc.id ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
