"use client"

import { useState } from "react"
import { Search, Plus, X, BookOpen, FileText, Scale, Lightbulb, History, Tag, Download, Eye } from "lucide-react"
import type { SessionUser } from "@/lib/session"

interface Article {
  id: string
  title: string
  category: "TEMPLATE" | "REGULATION" | "RESEARCH" | "PRECEDENT"
  content: string
  fileUrl?: string
  tags: string[]
  creatorName: string
  updatedAt: string
}

const CATEGORY_CONFIG = {
  TEMPLATE: { label: "Template", icon: FileText, color: "bg-blue-100 text-blue-700" },
  REGULATION: { label: "Regulation", icon: Scale, color: "bg-purple-100 text-purple-700" },
  RESEARCH: { label: "Legal Research", icon: Lightbulb, color: "bg-amber-100 text-amber-700" },
  PRECEDENT: { label: "Precedent", icon: History, color: "bg-green-100 text-green-700" },
}

const MOCK_ARTICLES: Article[] = [
  { id: "1", title: "Standard Civil Lawsuit (Gugatan) Template", category: "TEMPLATE", content: "Template gugatan perdata standar untuk perkara wanprestasi dan perbuatan melawan hukum. Mencakup bagian: identitas para pihak, posita, petitum, dan lampiran bukti.", tags: ["litigation", "civil", "template"], creatorName: "Sony Alfredo", updatedAt: "2026-05-15", fileUrl: "#" },
  { id: "2", title: "Legal Opinion — Corporate Acquisition Checklist", category: "TEMPLATE", content: "Standar format Legal Opinion untuk transaksi akuisisi perusahaan, meliputi due diligence scope, risk assessment, dan representations & warranties.", tags: ["corporate", "M&A", "legal opinion"], creatorName: "Reza Firmansyah", updatedAt: "2026-04-20", fileUrl: "#" },
  { id: "3", title: "Somasi Letter Template (Breach of Contract)", category: "TEMPLATE", content: "Template surat somasi untuk perkara wanprestasi dengan batas waktu 14 hari. Dilengkapi dengan format untuk tiga kali somasi berturut-turut.", tags: ["litigation", "somasi", "template"], creatorName: "Sony Alfredo", updatedAt: "2026-03-10" },
  { id: "4", title: "Trademark Registration Process — Post-Law No. 20/2016", category: "REGULATION", content: "Ringkasan prosedur pendaftaran merek berdasarkan UU No. 20 Tahun 2016 tentang Merek dan Indikasi Geografis, termasuk pembaruan tata cara pengajuan elektronik melalui DJKI.", tags: ["IP", "trademark", "regulation"], creatorName: "Siti Rahayu", updatedAt: "2026-02-28" },
  { id: "5", title: "Supreme Court Jurisprudence — Trademark Dispute 2024–2025", category: "PRECEDENT", content: "Kumpulan putusan Mahkamah Agung terkait sengketa merek dagang tahun 2024–2025. Analisis ratio decidendi dan implikasinya untuk strategi litigasi.", tags: ["IP", "trademark", "jurisprudence", "MA"], creatorName: "Sony Alfredo", updatedAt: "2026-05-01" },
  { id: "6", title: "Due Diligence Framework — Property Acquisition", category: "RESEARCH", content: "Framework due diligence untuk akuisisi aset properti komersial, mencakup: pemeriksaan sertifikat, IMB/PBG, sengketa, AMDAL, dan aspek pajak terkait.", tags: ["property", "due diligence", "corporate"], creatorName: "Reza Firmansyah", updatedAt: "2026-04-05" },
  { id: "7", title: "Deed of Assignment — Intellectual Property Rights", category: "TEMPLATE", content: "Template deed of assignment untuk pengalihan hak kekayaan intelektual (merek, paten, hak cipta) antar badan hukum. Bilingual: Bahasa Indonesia & English.", tags: ["IP", "corporate", "deed", "bilingual"], creatorName: "Sony Alfredo", updatedAt: "2026-01-20", fileUrl: "#" },
  { id: "8", title: "Employment Termination — Legal Requirements 2026", category: "REGULATION", content: "Update ketentuan PHK berdasarkan PP No. 35/2021 dan perkembangan putusan pengadilan terbaru. Mencakup prosedur bipartit, mediasi, dan penghitungan pesangon.", tags: ["employment", "PHK", "regulation"], creatorName: "Siti Rahayu", updatedAt: "2026-03-15" },
]

export default function KmsClient({ session }: { session: SessionUser }) {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES)
  const [form, setForm] = useState({ title: "", category: "TEMPLATE", content: "", tags: "" })

  const canCreate = ["PARTNER", "ASSOCIATE"].includes(session.role)

  const filtered = articles.filter((a) => {
    const matchSearch = !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    const matchCat = !categoryFilter || a.category === categoryFilter
    return matchSearch && matchCat
  })

  const grouped = (["TEMPLATE", "REGULATION", "RESEARCH", "PRECEDENT"] as const).map((cat) => ({
    category: cat,
    articles: filtered.filter((a) => a.category === cat),
  })).filter((g) => g.articles.length > 0)

  function handleAdd() {
    if (!form.title || !form.content) return
    const newArticle: Article = {
      id: Date.now().toString(),
      title: form.title,
      category: form.category as Article["category"],
      content: form.content,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      creatorName: session.name,
      updatedAt: new Date().toISOString().split("T")[0],
    }
    setArticles((prev) => [newArticle, ...prev])
    setShowForm(false)
    setForm({ title: "", category: "TEMPLATE", content: "", tags: "" })
    fetch("/api/kms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newArticle.title, category: newArticle.category, content: newArticle.content, tags: newArticle.tags }),
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-500 text-sm mt-0.5">Legal templates, regulations, and internal research library</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            <Plus size={16} /> Add Article
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {(Object.entries(CATEGORY_CONFIG) as [keyof typeof CATEGORY_CONFIG, typeof CATEGORY_CONFIG[keyof typeof CATEGORY_CONFIG]][]).map(([key, cfg]) => {
          const Icon = cfg.icon
          const count = articles.filter((a) => a.category === key).length
          return (
            <button key={key} onClick={() => setCategoryFilter(categoryFilter === key ? "" : key)}
              className={`bg-white rounded-xl border p-4 text-left transition hover:shadow-sm ${categoryFilter === key ? "border-amber-400" : "border-gray-200"}`}>
              <div className={`inline-flex p-2 rounded-lg mb-2 ${cfg.color}`}>
                <Icon size={15} />
              </div>
              <p className="text-xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500">{cfg.label}</p>
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, tag, or keyword..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
      </div>

      <div className="flex gap-6">
        {/* Article List */}
        <div className={`${selectedArticle ? "w-1/2" : "w-full"} transition-all space-y-6`}>

          {/* New Article Form */}
          {showForm && (
            <div className="bg-white rounded-xl border border-amber-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">New Knowledge Base Entry</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
                    <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. Standard Loan Agreement Template"
                      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
                    <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500">
                      {Object.entries(CATEGORY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Content / Description *</label>
                  <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                    rows={4} placeholder="Describe the content, scope, and how to use this document..."
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tags (comma-separated)</label>
                  <input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                    placeholder="litigation, template, corporate"
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              <button onClick={handleAdd}
                className="mt-4 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                Save Article
              </button>
            </div>
          )}

          {grouped.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
              <p>No articles found</p>
            </div>
          )}

          {grouped.map(({ category, articles: groupArticles }) => {
            const cfg = CATEGORY_CONFIG[category]
            const Icon = cfg.icon
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded-lg ${cfg.color}`}><Icon size={14} /></div>
                  <h2 className="font-semibold text-gray-700 text-sm">{cfg.label}</h2>
                  <span className="text-xs text-gray-400">{groupArticles.length} items</span>
                </div>
                <div className="space-y-2">
                  {groupArticles.map((article) => (
                    <div key={article.id}
                      onClick={() => setSelectedArticle(selectedArticle?.id === article.id ? null : article)}
                      className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm ${selectedArticle?.id === article.id ? "border-amber-400 shadow-sm" : "border-gray-200"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm">{article.title}</p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{article.content}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex gap-1 flex-wrap">
                              {article.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                  <Tag size={9} />{tag}
                                </span>
                              ))}
                            </div>
                            <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
                              {article.creatorName} · {new Date(article.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1.5 ml-2">
                          {article.fileUrl && (
                            <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                              <Download size={15} />
                            </button>
                          )}
                          <button className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition">
                            <Eye size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Article Detail Panel */}
        {selectedArticle && (
          <div className="w-1/2">
            <div className="bg-white rounded-xl border border-gray-200 sticky top-0">
              <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_CONFIG[selectedArticle.category].color}`}>
                    {CATEGORY_CONFIG[selectedArticle.category].label}
                  </span>
                  <h2 className="font-semibold text-gray-800 mt-2 leading-snug">{selectedArticle.title}</h2>
                </div>
                <button onClick={() => setSelectedArticle(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                  <X size={18} />
                </button>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm text-gray-600 leading-relaxed">{selectedArticle.content}</p>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedArticle.tags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                        <Tag size={10} />{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Created by <span className="font-medium text-gray-700">{selectedArticle.creatorName}</span></p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Last updated: {new Date(selectedArticle.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  {selectedArticle.fileUrl && (
                    <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition">
                      <Download size={13} /> Download
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
