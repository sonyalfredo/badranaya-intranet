import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { FileDown, BarChart2, Users, Clock, Receipt } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default async function ReportsPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  const isPartner = session.role === "PARTNER"
  const isFinance = session.role === "FINANCE"
  const isAdmin = session.role === "ADMIN"

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 text-sm mt-0.5">Export and view operational reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Billable Hours Report */}
        {(isPartner) && (
          <ReportCard
            icon={Clock}
            title="Billable Hours Report"
            description="Monthly billable and non-billable hours per lawyer. Includes target vs actual performance."
            color="amber"
            formats={["PDF", "Excel"]}
            filters={["Month", "Lawyer", "Matter", "Practice Area"]}
          />
        )}

        {/* Attendance Report */}
        {(isPartner || isAdmin) && (
          <ReportCard
            icon={Users}
            title="Attendance & Leave Report"
            description="Monthly attendance summary per employee. Includes check-in/out times, leave taken, and absences."
            color="blue"
            formats={["PDF", "Excel"]}
            filters={["Month", "Employee", "Department"]}
          />
        )}

        {/* Financial Report */}
        {(isPartner || isFinance) && (
          <ReportCard
            icon={Receipt}
            title="Expense Reimbursement Report"
            description="All reimbursement claims by status, category, and employee. Useful for monthly accounting close."
            color="green"
            formats={["PDF", "Excel"]}
            filters={["Month", "Status", "Category", "Employee"]}
          />
        )}

        {/* Invoice Report */}
        {(isPartner || isFinance) && (
          <ReportCard
            icon={BarChart2}
            title="Invoice & Revenue Report"
            description="Invoice status tracking, collection rate, and revenue by client and matter."
            color="purple"
            formats={["PDF", "Excel"]}
            filters={["Month", "Client", "Status"]}
          />
        )}
      </div>

      {/* Summary Table */}
      {isPartner && (
        <div className="mt-8 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">June 2026 — Team Performance Snapshot</h2>
            <button className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium">
              <FileDown size={15} /> Export All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">Lawyer</th>
                  <th className="px-5 py-3 text-left">Role</th>
                  <th className="px-5 py-3 text-center">Target (h)</th>
                  <th className="px-5 py-3 text-center">Billed (h)</th>
                  <th className="px-5 py-3 text-center">Utilisation</th>
                  <th className="px-5 py-3 text-right">Est. Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { name: "Sony Alfredo", role: "Senior Partner", target: 120, billed: 98, rate: 5000000 },
                  { name: "Reza Firmansyah", role: "Senior Associate", target: 160, billed: 134, rate: 2500000 },
                  { name: "Siti Rahayu", role: "Paralegal", target: 140, billed: 89, rate: 1500000 },
                ].map((row) => {
                  const util = Math.round((row.billed / row.target) * 100)
                  const color = util >= 90 ? "text-green-600" : util >= 70 ? "text-amber-600" : "text-red-600"
                  return (
                    <tr key={row.name} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-800">{row.name}</td>
                      <td className="px-5 py-3 text-gray-500">{row.role}</td>
                      <td className="px-5 py-3 text-center text-gray-600">{row.target}h</td>
                      <td className="px-5 py-3 text-center font-semibold text-gray-800">{row.billed}h</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`font-semibold ${color}`}>{util}%</span>
                      </td>
                      <td className="px-5 py-3 text-right text-gray-700">{formatCurrency(row.billed * row.rate)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function ReportCard({ icon: Icon, title, description, color, formats, filters }: {
  icon: React.ElementType; title: string; description: string
  color: string; formats: string[]; filters: string[]
}) {
  const colors: Record<string, string> = {
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-xl ${colors[color]} flex-shrink-0`}><Icon size={20} /></div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p>
          <div className="mt-3">
            <p className="text-xs text-gray-400 mb-1.5">Filter by: {filters.join(" · ")}</p>
            <div className="flex gap-2">
              {formats.map((fmt) => (
                <button key={fmt}
                  className="flex items-center gap-1.5 text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition">
                  <FileDown size={12} /> {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
