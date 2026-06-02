"use client"

import { useState } from "react"
import { Plus, X, Check, UserCircle, Shield, Target, Phone, Mail, Search } from "lucide-react"
import { getRoleLabel } from "@/lib/utils"
import type { SessionUser } from "@/lib/session"

interface Employee {
  id: string
  name: string
  email: string
  role: string
  position: string
  phone?: string
  targetBillableHoursMonthly: number
  isActive: boolean
}

const MOCK_EMPLOYEES: Employee[] = [
  { id: "1", name: "Sony Alfredo", email: "partner@badranaya.com", role: "PARTNER", position: "Senior Partner", phone: "0812-0001-0001", targetBillableHoursMonthly: 120, isActive: true },
  { id: "2", name: "Reza Firmansyah", email: "associate@badranaya.com", role: "ASSOCIATE", position: "Senior Associate", phone: "0812-0002-0002", targetBillableHoursMonthly: 160, isActive: true },
  { id: "3", name: "Siti Rahayu", email: "paralegal@badranaya.com", role: "PARALEGAL", position: "Paralegal", targetBillableHoursMonthly: 140, isActive: true },
  { id: "4", name: "Dewi Kusuma", email: "finance@badranaya.com", role: "FINANCE", position: "Finance Manager", targetBillableHoursMonthly: 0, isActive: true },
  { id: "5", name: "Andi Saputra", email: "admin@badranaya.com", role: "ADMIN", position: "HR & Admin", targetBillableHoursMonthly: 0, isActive: true },
]

const ROLE_COLORS: Record<string, string> = {
  PARTNER: "bg-amber-100 text-amber-700",
  ASSOCIATE: "bg-blue-100 text-blue-700",
  PARALEGAL: "bg-purple-100 text-purple-700",
  FINANCE: "bg-green-100 text-green-700",
  ADMIN: "bg-gray-100 text-gray-700",
}

export default function AdminClient({ session }: { session: SessionUser }) {
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null)
  const [form, setForm] = useState({
    name: "", email: "", role: "ASSOCIATE", position: "",
    phone: "", targetBillableHoursMonthly: "160", password: "",
  })

  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    e.position.toLowerCase().includes(search.toLowerCase())
  )

  function openNewForm() {
    setEditEmployee(null)
    setForm({ name: "", email: "", role: "ASSOCIATE", position: "", phone: "", targetBillableHoursMonthly: "160", password: "" })
    setShowForm(true)
  }

  function openEditForm(emp: Employee) {
    setEditEmployee(emp)
    setForm({ name: emp.name, email: emp.email, role: emp.role, position: emp.position, phone: emp.phone ?? "", targetBillableHoursMonthly: String(emp.targetBillableHoursMonthly), password: "" })
    setShowForm(true)
  }

  function handleSave() {
    if (!form.name || !form.email || !form.role || !form.position) return
    if (editEmployee) {
      setEmployees((prev) => prev.map((e) => e.id === editEmployee.id ? {
        ...e, name: form.name, email: form.email, role: form.role,
        position: form.position, phone: form.phone,
        targetBillableHoursMonthly: parseInt(form.targetBillableHoursMonthly) || 0,
      } : e))
    } else {
      const newEmp: Employee = {
        id: Date.now().toString(), name: form.name, email: form.email,
        role: form.role, position: form.position, phone: form.phone,
        targetBillableHoursMonthly: parseInt(form.targetBillableHoursMonthly) || 0,
        isActive: true,
      }
      setEmployees((prev) => [...prev, newEmp])
    }
    setShowForm(false)
  }

  function toggleActive(id: string) {
    setEmployees((prev) => prev.map((e) => e.id === id ? { ...e, isActive: !e.isActive } : e))
  }

  const activeCount = employees.filter((e) => e.isActive).length
  const byRole = (role: string) => employees.filter((e) => e.role === role && e.isActive).length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin & HR</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage employees, roles, and access</p>
        </div>
        <button onClick={openNewForm}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          <Plus size={16} /> Add Employee
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <StatBox label="Total Active" value={activeCount} />
        <StatBox label="Partners" value={byRole("PARTNER")} color="amber" />
        <StatBox label="Associates" value={byRole("ASSOCIATE")} color="blue" />
        <StatBox label="Paralegals" value={byRole("PARALEGAL")} color="purple" />
        <StatBox label="Support Staff" value={byRole("FINANCE") + byRole("ADMIN")} color="green" />
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employees..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-amber-200 p-5 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">{editEmployee ? "Edit Employee" : "Add New Employee"}</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Full Name *", key: "name", placeholder: "e.g. Ahmad Fauzi" },
              { label: "Email *", key: "email", placeholder: "name@badranaya.com" },
              { label: "Position *", key: "position", placeholder: "e.g. Junior Associate" },
              { label: "Phone", key: "phone", placeholder: "0812-xxxx-xxxx" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input value={(form as any)[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role *</label>
              <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500">
                {["PARTNER", "ASSOCIATE", "PARALEGAL", "FINANCE", "ADMIN"].map((r) => (
                  <option key={r} value={r}>{getRoleLabel(r)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Monthly Billable Target (hours)</label>
              <input type="number" value={form.targetBillableHoursMonthly}
                onChange={(e) => setForm((f) => ({ ...f, targetBillableHoursMonthly: e.target.value }))}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            {!editEmployee && (
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Initial Password *</label>
                <input type="password" value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Minimum 8 characters"
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
            )}
          </div>
          <button onClick={handleSave}
            className="mt-4 flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            <Check size={16} /> {editEmployee ? "Save Changes" : "Create Employee"}
          </button>
        </div>
      )}

      {/* Employee Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3 text-left">Employee</th>
                <th className="px-5 py-3 text-left">Role</th>
                <th className="px-5 py-3 text-left">Contact</th>
                <th className="px-5 py-3 text-center">Billable Target</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((emp) => (
                <tr key={emp.id} className={`hover:bg-gray-50 transition-colors ${!emp.isActive ? "opacity-50" : ""}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-slate-600">{emp.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{emp.name}</p>
                        <p className="text-xs text-gray-400">{emp.position}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_COLORS[emp.role]}`}>
                      {getRoleLabel(emp.role)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <p className="flex items-center gap-1.5 text-xs text-gray-600"><Mail size={11} /> {emp.email}</p>
                    {emp.phone && <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5"><Phone size={11} /> {emp.phone}</p>}
                  </td>
                  <td className="px-5 py-3 text-center text-gray-600">
                    {emp.targetBillableHoursMonthly > 0 ? `${emp.targetBillableHoursMonthly}h/mo` : "—"}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${emp.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {emp.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEditForm(emp)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 hover:bg-blue-50 rounded transition">
                        Edit
                      </button>
                      <button onClick={() => toggleActive(emp.id)}
                        className={`text-xs font-medium px-2 py-1 rounded transition ${emp.isActive ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}`}>
                        {emp.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
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

function StatBox({ label, value, color }: { label: string; value: number; color?: string }) {
  const colors: Record<string, string> = { amber: "text-amber-600", blue: "text-blue-600", purple: "text-purple-600", green: "text-green-600" }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
      <p className={`text-2xl font-bold ${color ? colors[color] : "text-gray-900"}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}
