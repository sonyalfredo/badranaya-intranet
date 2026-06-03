"use client"

import { useState, useEffect } from "react"
import { Calculator, Settings, Plus, X, Check, ChevronRight, FileText } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { SessionUser } from "@/lib/session"

interface BillingRate { id: string; position: string; ratePerHour: number }
interface LineItem { userId: string; userName: string; position: string; hours: number; ratePerHour: number; amount: number }
interface CalculationResult {
  matter: { id: string; matterCode: string; matterName: string; client: { companyName: string } }
  periodStart: string; periodEnd: string
  lineItems: LineItem[]; subtotal: number; totalEntries: number
}
interface Bill {
  id: string; billNumber: string; status: string
  matter: { matterCode: string; matterName: string; client: { companyName: string } }
  periodStart: string; periodEnd: string
  subtotal: number; discount: number; otherCharges: number; total: number
  lineItems: LineItem[]; createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SENT: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
}

export default function BillingClient({ session }: { session: SessionUser }) {
  const [tab, setTab] = useState<"calculator" | "bills" | "rates">("calculator")
  const [rates, setRates] = useState<BillingRate[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [calcForm, setCalcForm] = useState({
    matterId: "", periodStart: "", periodEnd: "",
  })
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [discount, setDiscount] = useState("0")
  const [otherCharges, setOtherCharges] = useState("0")
  const [billNotes, setBillNotes] = useState("")
  const [calculating, setCalculating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedBill, setSavedBill] = useState<Bill | null>(null)
  const [editRates, setEditRates] = useState(false)
  const [rateEdits, setRateEdits] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchRates()
    fetchBills()
  }, [])

  async function fetchRates() {
    const res = await fetch("/api/billing/rates")
    if (res.ok) setRates(await res.json())
  }

  async function fetchBills() {
    const res = await fetch("/api/billing")
    if (res.ok) setBills(await res.json())
  }

  async function handleCalculate() {
    if (!calcForm.matterId || !calcForm.periodStart || !calcForm.periodEnd) return
    setCalculating(true)
    setResult(null)
    setSavedBill(null)
    const res = await fetch("/api/billing/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(calcForm),
    })
    if (res.ok) setResult(await res.json())
    setCalculating(false)
  }

  async function handleSaveBill() {
    if (!result) return
    setSaving(true)
    const discountAmt = parseFloat(discount) || 0
    const otherAmt = parseFloat(otherCharges) || 0
    const res = await fetch("/api/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matterId: calcForm.matterId,
        periodStart: calcForm.periodStart,
        periodEnd: calcForm.periodEnd,
        lineItems: result.lineItems,
        subtotal: result.subtotal,
        discount: discountAmt,
        otherCharges: otherAmt,
        notes: billNotes,
      }),
    })
    if (res.ok) {
      const bill = await res.json()
      setSavedBill(bill)
      setBills((prev) => [bill, ...prev])
      setResult(null)
    }
    setSaving(false)
  }

  async function handleSaveRates() {
    const updated = rates.map((r) => ({
      position: r.position,
      ratePerHour: parseFloat(rateEdits[r.id] ?? String(r.ratePerHour)) || r.ratePerHour,
    }))
    const res = await fetch("/api/billing/rates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    })
    if (res.ok) { await fetchRates(); setEditRates(false); setRateEdits({}) }
  }

  const discountAmt = parseFloat(discount) || 0
  const otherAmt = parseFloat(otherCharges) || 0
  const grandTotal = result ? result.subtotal - discountAmt + otherAmt : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing Calculator</h1>
          <p className="text-gray-500 text-sm mt-0.5">Calculate fees from billable hours and generate bills</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: "calculator", label: "Calculator", icon: Calculator },
          { key: "bills", label: "Bills", icon: FileText },
          { key: "rates", label: "Billing Rates", icon: Settings },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === key ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ─── CALCULATOR TAB ─── */}
      {tab === "calculator" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Calculate Bill</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Matter ID *</label>
                <input value={calcForm.matterId} onChange={(e) => setCalcForm((f) => ({ ...f, matterId: e.target.value }))}
                  placeholder="Enter Matter ID from Clients & Matters"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Period Start *</label>
                  <input type="date" value={calcForm.periodStart} onChange={(e) => setCalcForm((f) => ({ ...f, periodStart: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Period End *</label>
                  <input type="date" value={calcForm.periodEnd} onChange={(e) => setCalcForm((f) => ({ ...f, periodEnd: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400/50" />
                </div>
              </div>
              <button onClick={handleCalculate} disabled={calculating || !calcForm.matterId || !calcForm.periodStart || !calcForm.periodEnd}
                className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-yellow-950 font-bold py-2.5 rounded-xl transition">
                <Calculator size={16} />
                {calculating ? "Calculating..." : "Calculate"}
              </button>
            </div>

            {/* Billing Rates Summary */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-3">Current Billing Rates</p>
              <div className="space-y-2">
                {rates.map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{r.position}</span>
                    <span className="font-semibold text-gray-800">{formatCurrency(r.ratePerHour)}<span className="text-gray-400 font-normal">/hr</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Result */}
          <div>
            {savedBill && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Check size={18} className="text-green-600" />
                  <p className="font-semibold text-green-800">Bill saved successfully!</p>
                </div>
                <p className="font-mono text-lg font-bold text-green-700">{savedBill.billNumber}</p>
                <p className="text-sm text-green-600 mt-1">Total: {formatCurrency(savedBill.total)}</p>
              </div>
            )}

            {result && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="mb-4">
                  <p className="font-semibold text-gray-800">{result.matter.client.companyName}</p>
                  <p className="text-sm text-gray-500">{result.matter.matterCode} — {result.matter.matterName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(result.periodStart).toLocaleDateString("en-GB")} — {new Date(result.periodEnd).toLocaleDateString("en-GB")}
                    {" · "}{result.totalEntries} approved entries
                  </p>
                </div>

                {/* Line Items */}
                <div className="border border-gray-100 rounded-xl overflow-hidden mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-xs text-gray-400 uppercase">
                        <th className="px-4 py-2.5 text-left">Lawyer</th>
                        <th className="px-4 py-2.5 text-center">Hours</th>
                        <th className="px-4 py-2.5 text-right">Rate/hr</th>
                        <th className="px-4 py-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {result.lineItems.length === 0 ? (
                        <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400 text-xs">No approved billable hours found for this period</td></tr>
                      ) : result.lineItems.map((item, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5">
                            <p className="font-medium text-gray-800">{item.userName}</p>
                            <p className="text-xs text-gray-400">{item.position}</p>
                          </td>
                          <td className="px-4 py-2.5 text-center text-gray-700">{item.hours}h</td>
                          <td className="px-4 py-2.5 text-right text-gray-600 text-xs">{formatCurrency(item.ratePerHour)}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-gray-800">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Adjustments */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-800">{formatCurrency(result.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-gray-600">Discount (Rp)</span>
                    <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)}
                      className="w-40 text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-right focus:outline-none focus:ring-2 focus:ring-yellow-400/50" />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-gray-600">Other Charges (Rp)</span>
                    <input type="number" value={otherCharges} onChange={(e) => setOtherCharges(e.target.value)}
                      className="w-40 text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-right focus:outline-none focus:ring-2 focus:ring-yellow-400/50" />
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="font-bold text-gray-800">Total</span>
                    <span className="text-xl font-bold text-yellow-600">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Notes</label>
                  <textarea value={billNotes} onChange={(e) => setBillNotes(e.target.value)} rows={2}
                    placeholder="Additional notes for this bill..."
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 resize-none" />
                </div>

                <button onClick={handleSaveBill} disabled={saving || result.lineItems.length === 0}
                  className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-yellow-950 font-bold py-2.5 rounded-xl transition">
                  <Check size={16} />
                  {saving ? "Saving..." : "Save Bill"}
                </button>
              </div>
            )}

            {!result && !savedBill && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <Calculator size={40} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-400 text-sm">Enter matter details and click Calculate</p>
                <p className="text-gray-300 text-xs mt-1">Only approved billable hours will be included</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── BILLS TAB ─── */}
      {tab === "bills" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800">All Bills</h2>
          </div>
          {bills.length === 0 ? (
            <div className="py-16 text-center">
              <FileText size={36} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">No bills yet</p>
              <p className="text-gray-300 text-xs mt-1">Use the Calculator tab to generate your first bill</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {bills.map((bill) => (
                <div key={bill.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-semibold text-gray-800">{bill.billNumber}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[bill.status]}`}>{bill.status}</span>
                    </div>
                    <p className="text-sm text-gray-600">{bill.matter.client.companyName} — {bill.matter.matterName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(bill.periodStart).toLocaleDateString("en-GB")} — {new Date(bill.periodEnd).toLocaleDateString("en-GB")}
                      {" · "}{bill.lineItems.length} lawyers
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-gray-900 text-lg">{formatCurrency(bill.total)}</p>
                    {bill.discount > 0 && <p className="text-xs text-green-600">-{formatCurrency(bill.discount)} discount</p>}
                    <p className="text-xs text-gray-400">{new Date(bill.createdAt).toLocaleDateString("en-GB")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── RATES TAB ─── */}
      {tab === "rates" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Billing Rates per Position</h2>
            {session.role === "PARTNER" && !editRates && (
              <button onClick={() => { setEditRates(true); setRateEdits(Object.fromEntries(rates.map((r) => [r.id, String(r.ratePerHour)]))) }}
                className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">Edit Rates</button>
            )}
            {editRates && (
              <div className="flex gap-3">
                <button onClick={handleSaveRates} className="flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-400 text-yellow-950 text-sm font-semibold px-4 py-1.5 rounded-lg transition">
                  <Check size={14} /> Save
                </button>
                <button onClick={() => { setEditRates(false); setRateEdits({}) }} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
              </div>
            )}
          </div>
          <div className="divide-y divide-gray-50">
            {rates.map((rate) => (
              <div key={rate.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{rate.position}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Per billable hour</p>
                </div>
                {editRates ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Rp</span>
                    <input
                      type="number"
                      value={rateEdits[rate.id] ?? rate.ratePerHour}
                      onChange={(e) => setRateEdits((r) => ({ ...r, [rate.id]: e.target.value }))}
                      className="w-36 text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-right focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                    />
                    <span className="text-sm text-gray-400">/ hr</span>
                  </div>
                ) : (
                  <p className="font-bold text-gray-800 text-lg">{formatCurrency(rate.ratePerHour)}<span className="text-sm font-normal text-gray-400"> / hr</span></p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
