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
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-400 text-sm">No data yet — team performance will appear here once employees start logging hours.</p>
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
