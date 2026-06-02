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
    if (!res.ok) { setError(data.error ?? "Login failed"); return }
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex bg-[#0f0f1a]">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        <div className="relative z-10 text-center max-w-sm">
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur shadow-2xl p-4">
              <Image src="/badranaya-logo.png" alt="Badranaya Partnership" width={96} height={96} className="object-contain" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Badranaya Partnership</h1>
          <p className="text-white/40 text-sm leading-relaxed">
            Internal employee portal for time tracking, client management, and operational excellence.
          </p>
          <div className="flex items-center justify-center gap-6 mt-10">
            {["Secure", "Private", "Professional"].map((label) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                <span className="text-xs text-white/30">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow">
              <Image src="/badranaya-logo.png" alt="BP" width={32} height={32} className="object-contain" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Badranaya Partnership</p>
              <p className="text-white/40 text-xs">Employee Portal</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-white/40 text-sm mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@badranaya.com"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-yellow-950 font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 hover:-translate-y-0.5 active:translate-y-0 text-sm mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-white/20 text-xs mt-8">
            Having trouble? Contact your IT Administrator
          </p>
        </div>
      </div>
    </div>
  )
}
