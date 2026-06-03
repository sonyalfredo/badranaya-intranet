"use client"

import { useState } from "react"
import { Plus, X, Check, Upload, Receipt, FileText, TrendingUp, AlertCircle, Image, Loader2 } from "lucide-react"
import { useRef } from "react"
import { formatCurrency } from "@/lib/utils"
import type { SessionUser } from "@/lib/session"

interface Reimbursement {
  id: string
  userId: string
  userName: string
  userPosition?: string
  matterId?: string
  matterCode?: string
  category: string
  amount: number
  description: string
  receiptUrl?: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID"
  submittedAt: string
}

interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  matterName: string
  matterCode: string
  amount: number
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE"
  dueDate?: string
  issuedAt: string
  paidAt?: string
}

const CATEGORY_LABELS: Record<string, string> = {
  transport: "Transportation",
  leges: "Court Fees / PNBP",
  courier: "Courier / Delivery",
  entertainment: "Client Entertainment",
  accommodation: "Accommodation",
  other: "Other",
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-blue-100 text-blue-700",
  REJECTED: "bg-red-100 text-red-700",
  PAID: "bg-green-100 text-green-700",
  DRAFT: "bg-gray-100 text-gray-600",
  SENT: "bg-blue-100 text-blue-700",
  OVERDUE: "bg-red-100 text-red-700",
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PAID: "Paid",
  DRAFT: "Draft",
  SENT: "Sent",
  OVERDUE: "Due Date",
}

const REIMBURSEMENTS: Reimbursement[] = []

const INVOICES: Invoice[] = []

export default function FinanceClient({ session }: { session: SessionUser }) {
  const [tab, setTab] = useState<"reimbursement" | "invoice">("reimbursement")
  const isManager = session.role === "PARTNER" || session.role === "FINANCE"
  const canViewInvoice = isManager
  const canSubmitReimburse = ["PARTNER", "ASSOCIATE", "PARALEGAL"].includes(session.role)

  const [reimbursements, setReimbursements] = useState<Reimbursement[]>(
    isManager ? REIMBURSEMENTS : REIMBURSEMENTS.filter((r) => r.userId === "u1")
  )
  const [invoices, setInvoices] = useState<Invoice[]>(INVOICES)
  const [showReimburseForm, setShowReimburseForm] = useState(false)
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [reimburseForm, setReimburseForm] = useState({ category: "transport", amount: "", description: "", matterCode: "" })
  const [invoiceForm, setInvoiceForm] = useState({ matterId: "", amount: "", dueDate: "", notes: "" })
  const [statusFilter, setStatusFilter] = useState("")
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptUrl, setReceiptUrl] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Summary stats
  const totalPending = reimbursements.filter((r) => r.status === "PENDING").reduce((s, r) => s + r.amount, 0)
  const totalPendingCount = reimbursements.filter((r) => r.status === "PENDING").length
  const invoiceOutstanding = invoices.filter((i) => i.status === "SENT" || i.status === "OVERDUE").reduce((s, i) => s + i.amount, 0)
  const invoiceOverdueCount = invoices.filter((i) => i.status === "OVERDUE").length
  const invoicePaidMonth = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0)

  function handleReimburseAction(id: string, action: "approve" | "reject" | "pay") {
    const statusMap = { approve: "APPROVED", reject: "REJECTED", pay: "PAID" } as const
    setReimbursements((prev) =>
      prev.map((r) => r.id === id ? { ...r, status: statusMap[action] } : r)
    )
    fetch(`/api/reimbursements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
  }

  function handleInvoiceStatus(id: string, status: string) {
    setInvoices((prev) =>
      prev.map((inv) => inv.id === id ? { ...inv, status: status as any, ...(status === "PAID" ? { paidAt: new Date().toISOString() } : {}) } : inv)
    )
    fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setReceiptFile(file)
    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: fd })
    const data = await res.json()
    setUploading(false)
    if (res.ok) {
      setReceiptUrl(data.url)
    } else {
      alert(data.error ?? "Upload failed")
      setReceiptFile(null)
    }
  }

  async function handleAddReimburse() {
    if (!reimburseForm.amount || !reimburseForm.description) return
    const newItem: Reimbursement = {
      id: Date.now().toString(),
      userId: session.id,
      userName: session.name,
      userPosition: session.position,
      matterCode: reimburseForm.matterCode || undefined,
      category: reimburseForm.category,
      amount: parseFloat(reimburseForm.amount),
      description: reimburseForm.description,
      receiptUrl: receiptUrl || undefined,
      status: "PENDING",
      submittedAt: new Date().toISOString(),
    }
    setReimbursements((prev) => [newItem, ...prev])
    setShowReimburseForm(false)
    setReimburseForm({ category: "transport", amount: "", description: "", matterCode: "" })
    setReceiptFile(null)
    setReceiptUrl("")
    fetch("/api/reimbursements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: newItem.category, amount: newItem.amount, description: newItem.description, receiptUrl: receiptUrl || undefined }),
    })
  }

  const filteredReimburse = statusFilter
    ? reimbursements.filter((r) => r.status === statusFilter)
    : reimbursements

  const filteredInvoice = statusFilter
    ? invoices.filter((i) => i.status === statusFilter)
    : invoices

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
          <p className="text-gray-500 text-sm mt-0.5">Expense reimbursements and client invoice tracking</p>
        </div>
        {canSubmitReimburse && tab === "reimbursement" && (
          <button onClick={() => setShowReimburseForm(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            <Plus size={16} /> Submit Expense
          </button>
        )}
        {isManager && tab === "invoice" && (
          <button onClick={() => setShowInvoiceForm(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            <Plus size={16} /> Create Invoice
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard icon={Receipt} label="Pending Reimbursements" value={formatCurrency(totalPending)} sub={`${totalPendingCount} requests`} color="yellow" />
        {canViewInvoice && (
          <>
            <SummaryCard icon={FileText} label="Outstanding Invoices" value={formatCurrency(invoiceOutstanding)} sub={`${invoiceOverdueCount} overdue`} color="blue" />
            <SummaryCard icon={TrendingUp} label="Total Collected" value={formatCurrency(invoicePaidMonth)} sub="Total terbayar" color="green" />
            <SummaryCard icon={AlertCircle} label="Overdue Invoices" value={String(invoiceOverdueCount)} sub="Needs follow-up" color="red" />
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
        <TabButton active={tab === "reimbursement"} onClick={() => { setTab("reimbursement"); setStatusFilter("") }} label="Reimbursement" />
        {canViewInvoice && (
          <TabButton active={tab === "invoice"} onClick={() => { setTab("invoice"); setStatusFilter("") }} label="Invoice Klien" />
        )}
      </div>

      {/* ─── REIMBURSEMENT TAB ─── */}
      {tab === "reimbursement" && (
        <div>
          {/* Form */}
          {showReimburseForm && (
            <div className="bg-white rounded-xl border border-amber-200 p-5 mb-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Expense Reimbursement</h3>
                <button onClick={() => setShowReimburseForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
                  <select value={reimburseForm.category} onChange={(e) => setReimburseForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500">
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Amount (IDR) *</label>
                  <input type="number" value={reimburseForm.amount} onChange={(e) => setReimburseForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="150000"
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Matter Code (optional)</label>
                  <input value={reimburseForm.matterCode} onChange={(e) => setReimburseForm((f) => ({ ...f, matterCode: e.target.value }))}
                    placeholder="BP-2026-001"
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div className="flex items-end">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className={`w-full flex items-center justify-center gap-2 text-sm py-2 rounded-lg transition border ${
                      receiptUrl
                        ? "border-green-300 bg-green-50 text-green-700"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {uploading ? (
                      <><Loader2 size={15} className="animate-spin" /> Uploading...</>
                    ) : receiptUrl ? (
                      <><Check size={15} /> {receiptFile?.name ?? "Receipt uploaded"}</>
                    ) : (
                      <><Upload size={15} /> Upload Receipt (JPG/PNG/PDF)</>
                    )}
                  </button>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description *</label>
                  <textarea value={reimburseForm.description} onChange={(e) => setReimburseForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3} placeholder="Describe the expense in detail..."
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
                </div>
              </div>
              <button onClick={handleAddReimburse}
                className="mt-4 flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                <Check size={16} /> Submit Request
              </button>
            </div>
          )}

          {/* Filter */}
          <div className="flex gap-2 mb-3">
            {["", "PENDING", "APPROVED", "PAID", "REJECTED"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${statusFilter === s ? "bg-slate-800 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                {s === "" ? "All" : STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-3">
            {filteredReimburse.map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {CATEGORY_LABELS[r.category]}
                      </span>
                      {r.matterCode && (
                        <span className="text-xs text-gray-400 font-mono">{r.matterCode}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{r.description}</p>
                    {isManager && (
                      <p className="text-xs text-gray-400 mt-1">{r.userName} · {r.userPosition}</p>
                    )}
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-xs text-gray-400">
                        {new Date(r.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                      {r.receiptUrl && (
                        <a href={r.receiptUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                          <Image size={11} /> View Receipt
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-bold text-gray-900">{formatCurrency(r.amount)}</p>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[r.status]}`}>
                      {STATUS_LABELS[r.status]}
                    </span>
                    {isManager && r.status === "PENDING" && (
                      <div className="flex gap-2">
                        <button onClick={() => handleReimburseAction(r.id, "approve")}
                          className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-full font-medium transition">
                          Approve
                        </button>
                        <button onClick={() => handleReimburseAction(r.id, "reject")}
                          className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-full font-medium transition">
                          Reject
                        </button>
                      </div>
                    )}
                    {isManager && r.status === "APPROVED" && (
                      <button onClick={() => handleReimburseAction(r.id, "pay")}
                        className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-full font-medium transition">
                        Mark as Paid
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredReimburse.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">Tidak ada data reimbursement</div>
            )}
          </div>
        </div>
      )}

      {/* ─── INVOICE TAB ─── */}
      {tab === "invoice" && canViewInvoice && (
        <div>
          {/* New Invoice Form */}
          {showInvoiceForm && (
            <div className="bg-white rounded-xl border border-amber-200 p-5 mb-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">New Invoice</h3>
                <button onClick={() => setShowInvoiceForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Matter Code *</label>
                  <input value={invoiceForm.matterId} onChange={(e) => setInvoiceForm((f) => ({ ...f, matterId: e.target.value }))}
                    placeholder="BP-2026-001"
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Amount (IDR) *</label>
                  <input type="number" value={invoiceForm.amount} onChange={(e) => setInvoiceForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="50000000"
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
                  <input type="date" value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm((f) => ({ ...f, dueDate: e.target.value }))}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Catatan</label>
                  <input value={invoiceForm.notes} onChange={(e) => setInvoiceForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Optional"
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              <button className="mt-4 flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                <Check size={16} /> Create Invoice
              </button>
            </div>
          )}

          {/* Filter */}
          <div className="flex gap-2 mb-3">
            {["", "DRAFT", "SENT", "PAID", "OVERDUE"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${statusFilter === s ? "bg-slate-800 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                {s === "" ? "All" : STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          {/* Invoice Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-5 py-3 text-left">No. Invoice</th>
                    <th className="px-5 py-3 text-left">Klien / Matter</th>
                    <th className="px-5 py-3 text-right">Jumlah</th>
                    <th className="px-5 py-3 text-center">Due Date</th>
                    <th className="px-5 py-3 text-center">Status</th>
                    <th className="px-5 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredInvoice.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-mono text-xs text-gray-500">{inv.invoiceNumber}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(inv.issuedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-800">{inv.clientName}</p>
                        <p className="text-xs text-gray-400">{inv.matterCode} · {inv.matterName}</p>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-800">
                        {formatCurrency(inv.amount)}
                      </td>
                      <td className="px-5 py-3 text-center text-xs text-gray-600">
                        {inv.dueDate
                          ? new Date(inv.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[inv.status]}`}>
                          {STATUS_LABELS[inv.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {inv.status === "DRAFT" && (
                            <button onClick={() => handleInvoiceStatus(inv.id, "SENT")}
                              className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2.5 py-1 rounded-full font-medium transition">
                              Kirim
                            </button>
                          )}
                          {inv.status === "SENT" && (
                            <button onClick={() => handleInvoiceStatus(inv.id, "PAID")}
                              className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2.5 py-1 rounded-full font-medium transition">
                              Mark as Paid
                            </button>
                          )}
                          {inv.status === "OVERDUE" && (
                            <button onClick={() => handleInvoiceStatus(inv.id, "PAID")}
                              className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2.5 py-1 rounded-full font-medium transition">
                              Mark as Paid
                            </button>
                          )}
                          {inv.status === "PAID" && inv.paidAt && (
                            <span className="text-xs text-gray-400">
                              Paid on {new Date(inv.paidAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: string; sub: string; color: string }) {
  const colors: Record<string, string> = {
    yellow: "bg-yellow-50 text-yellow-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className={`inline-flex p-2 rounded-lg mb-3 ${colors[color]}`}>
        <Icon size={16} />
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  )
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2 rounded-md text-sm font-medium transition ${active ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"}`}>
      {label}
    </button>
  )
}
