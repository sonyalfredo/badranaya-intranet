"use client"

import { useState } from "react"
import { Search, Plus, X, Building2, Phone, Mail, ChevronRight, Briefcase } from "lucide-react"
import type { SessionUser } from "@/lib/session"

interface Client {
  id: string
  companyName: string
  picName: string
  picEmail?: string
  picPhone?: string
  industry?: string
  status: "ACTIVE" | "INACTIVE" | "PROSPECT"
  notes?: string
  activeMatterCount: number
  totalMatterCount: number
}

interface Matter {
  id: string
  matterCode: string
  matterName: string
  practiceArea: string
  status: string
  lawyerName: string
  openedAt: string
}

const PRACTICE_AREA_LABELS: Record<string, string> = {
  LITIGATION: "Litigasi",
  CORPORATE: "Korporasi",
  TAX: "Pajak",
  IP: "Kekayaan Intelektual",
  EMPLOYMENT: "Ketenagakerjaan",
  PROPERTY: "Properti",
  OTHER: "Lainnya",
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-100 text-gray-600",
  PROSPECT: "bg-blue-100 text-blue-700",
  ON_HOLD: "bg-yellow-100 text-yellow-700",
  CLOSED: "bg-gray-100 text-gray-500",
  BILLED: "bg-purple-100 text-purple-700",
}

const MOCK_CLIENTS: Client[] = [
  { id: "1", companyName: "PT Mowilex Indonesia", picName: "Budi Santoso", picEmail: "budi@mowilex.com", picPhone: "0812-3456-7890", industry: "Manufaktur Cat", status: "ACTIVE", activeMatterCount: 2, totalMatterCount: 5 },
  { id: "2", companyName: "PT Sinar Mas Group", picName: "Dewi Rahayu", picEmail: "dewi@sinarmas.com", picPhone: "0821-9876-5432", industry: "Konglomerasi", status: "ACTIVE", activeMatterCount: 1, totalMatterCount: 3 },
  { id: "3", companyName: "PT Ciputra Development", picName: "Hendra Wijaya", picEmail: "hendra@ciputra.com", industry: "Properti", status: "ACTIVE", activeMatterCount: 1, totalMatterCount: 1 },
  { id: "4", companyName: "CV Berkah Mandiri", picName: "Siti Aminah", picPhone: "0878-1234-5678", industry: "Perdagangan", status: "PROSPECT", activeMatterCount: 0, totalMatterCount: 0 },
  { id: "5", companyName: "PT Garuda Emas Tbk", picName: "Ronny Halim", picEmail: "ronny@garudaemas.com", industry: "Pertambangan", status: "INACTIVE", activeMatterCount: 0, totalMatterCount: 2 },
]

const MOCK_MATTERS: Record<string, Matter[]> = {
  "1": [
    { id: "1", matterCode: "BP-2026-001", matterName: "Sengketa Merek Dagang", practiceArea: "IP", status: "ACTIVE", lawyerName: "Sony Alfredo", openedAt: "2026-01-15" },
    { id: "2", matterCode: "BP-2025-008", matterName: "Gugatan Wanprestasi Distributor", practiceArea: "LITIGATION", status: "ACTIVE", lawyerName: "Reza Firmansyah", openedAt: "2025-08-10" },
    { id: "3", matterCode: "BP-2024-015", matterName: "Permohonan Pailit PT XYZ", practiceArea: "LITIGATION", status: "CLOSED", lawyerName: "Sony Alfredo", openedAt: "2024-05-20" },
  ],
  "2": [
    { id: "4", matterCode: "BP-2026-002", matterName: "Akuisisi PT Maju Bersama", practiceArea: "CORPORATE", status: "ACTIVE", lawyerName: "Sony Alfredo", openedAt: "2026-03-01" },
  ],
  "3": [
    { id: "5", matterCode: "BP-2026-003", matterName: "Due Diligence Properti Surabaya", practiceArea: "PROPERTY", status: "ACTIVE", lawyerName: "Andi Saputra", openedAt: "2026-04-12" },
  ],
}

export default function ClientsClient({ session }: { session: SessionUser }) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showNewClientForm, setShowNewClientForm] = useState(false)
  const [showNewMatterForm, setShowNewMatterForm] = useState(false)
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS)
  const [clientForm, setClientForm] = useState({ companyName: "", picName: "", picEmail: "", picPhone: "", industry: "", notes: "" })
  const [matterForm, setMatterForm] = useState({ matterName: "", practiceArea: "LITIGATION", description: "" })

  const canEdit = ["PARTNER", "ASSOCIATE"].includes(session.role)

  const filtered = clients.filter((c) => {
    const matchSearch = c.companyName.toLowerCase().includes(search.toLowerCase()) || c.picName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || c.status === statusFilter
    return matchSearch && matchStatus
  })

  function handleAddClient() {
    if (!clientForm.companyName || !clientForm.picName) return
    const newClient: Client = {
      id: Date.now().toString(),
      ...clientForm,
      status: "ACTIVE",
      activeMatterCount: 0,
      totalMatterCount: 0,
    }
    setClients((prev) => [newClient, ...prev])
    setShowNewClientForm(false)
    setClientForm({ companyName: "", picName: "", picEmail: "", picPhone: "", industry: "", notes: "" })
  }

  const matters = selectedClient ? (MOCK_MATTERS[selectedClient.id] ?? []) : []

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Klien & Matter</h1>
          <p className="text-gray-500 text-sm mt-0.5">Database klien dan pengelolaan perkara</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowNewClientForm(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            <Plus size={16} /> Tambah Klien
          </button>
        )}
      </div>

      <div className="flex gap-6">
        {/* Client List */}
        <div className={`${selectedClient ? "w-1/2" : "w-full"} transition-all`}>
          {/* Search & Filter */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari klien atau PIC..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="PROSPECT">Prospek</option>
              <option value="INACTIVE">Tidak Aktif</option>
            </select>
          </div>

          {/* New Client Form */}
          {showNewClientForm && (
            <div className="bg-white rounded-xl border border-amber-200 p-5 mb-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Tambah Klien Baru</h3>
                <button onClick={() => setShowNewClientForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Nama Perusahaan *", key: "companyName", placeholder: "PT Contoh Indonesia" },
                  { label: "Nama PIC *", key: "picName", placeholder: "Nama Contact Person" },
                  { label: "Email PIC", key: "picEmail", placeholder: "email@perusahaan.com" },
                  { label: "Telepon PIC", key: "picPhone", placeholder: "0812-xxxx-xxxx" },
                  { label: "Industri", key: "industry", placeholder: "Manufaktur, Properti, dll" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                    <input
                      value={(clientForm as any)[key]}
                      onChange={(e) => setClientForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Catatan</label>
                  <textarea
                    value={clientForm.notes}
                    onChange={(e) => setClientForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={2}
                    placeholder="Catatan tambahan..."
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                </div>
              </div>
              <button onClick={handleAddClient} className="mt-4 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                Simpan Klien
              </button>
            </div>
          )}

          {/* Client Cards */}
          <div className="space-y-3">
            {filtered.map((client) => (
              <div
                key={client.id}
                onClick={() => setSelectedClient(selectedClient?.id === client.id ? null : client)}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${selectedClient?.id === client.id ? "border-amber-400 shadow-md" : "border-gray-200"}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 size={16} className="text-slate-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm truncate">{client.companyName}</p>
                        <p className="text-xs text-gray-500">{client.industry}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 ml-10">
                      <p className="text-xs text-gray-500 flex items-center gap-1"><Mail size={11} /> {client.picName}</p>
                      {client.picPhone && <p className="text-xs text-gray-500 flex items-center gap-1"><Phone size={11} /> {client.picPhone}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[client.status]}`}>
                      {client.status === "ACTIVE" ? "Aktif" : client.status === "PROSPECT" ? "Prospek" : "Non-Aktif"}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Briefcase size={11} />
                      <span>{client.activeMatterCount} aktif / {client.totalMatterCount} total</span>
                    </div>
                    <ChevronRight size={16} className={`text-gray-400 transition-transform ${selectedClient?.id === client.id ? "rotate-90" : ""}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Matter Detail Panel */}
        {selectedClient && (
          <div className="w-1/2">
            <div className="bg-white rounded-xl border border-gray-200 sticky top-0">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-800">{selectedClient.companyName}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Daftar Matter / Perkara</p>
                </div>
                <div className="flex gap-2">
                  {canEdit && (
                    <button
                      onClick={() => setShowNewMatterForm(true)}
                      className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
                    >
                      <Plus size={13} /> Matter Baru
                    </button>
                  )}
                  <button onClick={() => setSelectedClient(null)} className="text-gray-400 hover:text-gray-600">
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Client Detail */}
              <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">PIC</p>
                    <p className="font-medium text-gray-700">{selectedClient.picName}</p>
                  </div>
                  {selectedClient.picEmail && (
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-gray-700 truncate">{selectedClient.picEmail}</p>
                    </div>
                  )}
                  {selectedClient.picPhone && (
                    <div>
                      <p className="text-xs text-gray-500">Telepon</p>
                      <p className="font-medium text-gray-700">{selectedClient.picPhone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500">Industri</p>
                    <p className="font-medium text-gray-700">{selectedClient.industry ?? "—"}</p>
                  </div>
                </div>
              </div>

              {/* New Matter Form */}
              {showNewMatterForm && (
                <div className="px-5 py-4 bg-amber-50 border-b border-amber-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-800 text-sm">Matter Baru</h4>
                    <button onClick={() => setShowNewMatterForm(false)} className="text-gray-400"><X size={16} /></button>
                  </div>
                  <div className="space-y-3">
                    <input
                      value={matterForm.matterName}
                      onChange={(e) => setMatterForm((f) => ({ ...f, matterName: e.target.value }))}
                      placeholder="Nama Matter / Perkara"
                      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <select
                      value={matterForm.practiceArea}
                      onChange={(e) => setMatterForm((f) => ({ ...f, practiceArea: e.target.value }))}
                      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {Object.entries(PRACTICE_AREA_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                    <textarea
                      value={matterForm.description}
                      onChange={(e) => setMatterForm((f) => ({ ...f, description: e.target.value }))}
                      rows={2}
                      placeholder="Deskripsi singkat..."
                      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    />
                    <button className="w-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium py-2 rounded-lg transition">
                      Buat Matter
                    </button>
                  </div>
                </div>
              )}

              {/* Matter List */}
              <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                {matters.length === 0 ? (
                  <div className="px-5 py-8 text-center text-gray-400 text-sm">Belum ada matter untuk klien ini</div>
                ) : (
                  matters.map((matter) => (
                    <div key={matter.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-400 font-mono">{matter.matterCode}</p>
                          <p className="font-medium text-gray-800 text-sm mt-0.5">{matter.matterName}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              {PRACTICE_AREA_LABELS[matter.practiceArea]}
                            </span>
                            <span className="text-xs text-gray-400">{matter.lawyerName}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Dibuka: {new Date(matter.openedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-3 ${STATUS_COLORS[matter.status]}`}>
                          {matter.status === "ACTIVE" ? "Aktif" : matter.status === "CLOSED" ? "Selesai" : matter.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
