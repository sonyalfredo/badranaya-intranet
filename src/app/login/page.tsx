"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? "Invalid credentials"); return }
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c18] px-4">

      {/* Ambient glows */}
      <div className="fixed top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-yellow-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-200px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-yellow-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-[360px]">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-white/95 flex items-center justify-center shadow-2xl shadow-yellow-500/20 mb-5 p-2">
            <Image src="/badranaya-logo.png" alt="Badranaya" width={52} height={52} className="object-contain" />
          </div>
          <p className="text-white font-semibold text-lg tracking-tight">Badranaya Partnership</p>
          <p className="text-white/30 text-xs mt-1 tracking-wider uppercase">Employee Portal</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/[0.04] border border-white/8 rounded-2xl p-6 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              autoComplete="email"
              className="w-full px-4 py-3 bg-white/5 border border-white/8 rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-yellow-500/60 focus:border-yellow-500/40 transition"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-white/5 border border-white/8 rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-yellow-500/60 focus:border-yellow-500/40 transition"
            />

            {error && (
              <p className="text-red-400 text-xs px-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 active:scale-[0.98] disabled:opacity-40 text-yellow-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-yellow-500/25 text-sm mt-1"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-white/15 text-xs mt-8">
          © 2026 Badranaya Partnership · Internal Use Only
        </p>
      </div>
    </div>
  )
}
