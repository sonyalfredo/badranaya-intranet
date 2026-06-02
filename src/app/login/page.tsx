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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0c0c18 0%, #111128 50%, #0a0a14 100%)", padding: "1rem" }}>

      {/* Glow top */}
      <div style={{ position: "fixed", top: "-150px", left: "50%", transform: "translateX(-50%)", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(212,160,23,0.12) 0%, transparent 70%)", pointerEvents: "none", borderRadius: "50%" }} />

      <div style={{ width: "100%", maxWidth: "340px", position: "relative" }}>

        {/* Logo & Brand */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2rem" }}>
          <div style={{ width: "68px", height: "68px", borderRadius: "18px", background: "white", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 60px rgba(212,160,23,0.25)", marginBottom: "1.25rem", padding: "8px" }}>
            <Image src="/badranaya-logo.png" alt="Badranaya" width={52} height={52} style={{ objectFit: "contain" }} />
          </div>
          <p style={{ color: "white", fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.02em", margin: 0 }}>Badranaya Partnership</p>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", marginTop: "0.25rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>Employee Portal</p>
        </div>

        {/* Card */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "1.5rem", backdropFilter: "blur(12px)" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              autoComplete="email"
              style={{ width: "100%", padding: "0.8rem 1rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              autoComplete="current-password"
              style={{ width: "100%", padding: "0.8rem 1rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
            />

            {error && (
              <p style={{ color: "#f87171", fontSize: "0.75rem", margin: 0, paddingLeft: "0.25rem" }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "0.875rem", background: loading ? "rgba(212,160,23,0.5)" : "#d4a017", border: "none", borderRadius: "12px", color: "#1a0f00", fontWeight: 700, fontSize: "0.875rem", cursor: loading ? "not-allowed" : "pointer", marginTop: "0.25rem", boxShadow: "0 8px 30px rgba(212,160,23,0.3)", transition: "all 0.15s ease" }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.15)", fontSize: "0.7rem", marginTop: "2rem" }}>
          © 2026 Badranaya Partnership · Internal Use Only
        </p>
      </div>
    </div>
  )
}
