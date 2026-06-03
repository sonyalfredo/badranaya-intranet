"use client"

import { useState } from "react"
import { User, Lock, Check, Eye, EyeOff, Phone, Mail, Briefcase, Shield } from "lucide-react"
import { getRoleLabel, formatHours } from "@/lib/utils"
import type { SessionUser } from "@/lib/session"

const ROLE_COLORS: Record<string, string> = {
  PARTNER: "bg-yellow-100 text-yellow-700",
  ASSOCIATE: "bg-blue-100 text-blue-700",
  PARALEGAL: "bg-purple-100 text-purple-700",
  FINANCE: "bg-green-100 text-green-700",
  ADMIN: "bg-gray-100 text-gray-700",
}

export default function ProfileClient({ session }: { session: SessionUser }) {
  const [tab, setTab] = useState<"profile" | "password">("profile")

  // Profile form
  const [name, setName] = useState(session.name)
  const [phone, setPhone] = useState("")
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState("")

  // Password form
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  const initials = session.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

  async function handleSaveProfile() {
    setProfileSaving(true)
    setProfileError("")
    setProfileSuccess(false)
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    })
    const data = await res.json()
    setProfileSaving(false)
    if (!res.ok) { setProfileError(data.error ?? "Failed to update profile"); return }
    setProfileSuccess(true)
    setTimeout(() => setProfileSuccess(false), 3000)
  }

  async function handleChangePassword() {
    setPasswordError("")
    setPasswordSuccess(false)
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match")
      return
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      return
    }
    setPasswordSaving(true)
    const res = await fetch("/api/profile/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    const data = await res.json()
    setPasswordSaving(false)
    if (!res.ok) { setPasswordError(data.error ?? "Failed to change password"); return }
    setPasswordSuccess(true)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setTimeout(() => setPasswordSuccess(false), 4000)
  }

  // Password strength
  const strength = newPassword.length === 0 ? 0
    : newPassword.length < 8 ? 1
    : newPassword.length < 12 && !/[^a-zA-Z0-9]/.test(newPassword) ? 2
    : 3

  const strengthLabel = ["", "Weak", "Medium", "Strong"]
  const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-green-500"]

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your personal information and security</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-yellow-950 font-bold text-xl">{initials}</span>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{session.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[session.role]}`}>
                {getRoleLabel(session.role)}
              </span>
              {session.position && (
                <span className="text-sm text-gray-500">{session.position}</span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
              <Mail size={11} /> {session.email}
            </p>
          </div>
        </div>

        {/* Stats */}
        {session.targetBillableHoursMonthly > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-gray-100">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Monthly Target</p>
              <p className="text-lg font-bold text-gray-800 mt-0.5">{formatHours(session.targetBillableHoursMonthly)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Role Access</p>
              <p className="text-lg font-bold text-gray-800 mt-0.5">{getRoleLabel(session.role)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        <button onClick={() => setTab("profile")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === "profile" ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"}`}>
          <User size={14} /> Personal Info
        </button>
        <button onClick={() => setTab("password")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === "password" ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"}`}>
          <Lock size={14} /> Change Password
        </button>
      </div>

      {/* Personal Info Tab */}
      {tab === "profile" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-5">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Email Address</label>
              <div className="flex items-center gap-3 w-full text-sm border border-gray-100 rounded-xl px-4 py-2.5 bg-gray-50 text-gray-400">
                <Mail size={14} />
                {session.email}
                <span className="ml-auto text-xs text-gray-300">Cannot be changed</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone Number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0812-xxxx-xxxx"
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Position</label>
              <div className="flex items-center gap-3 w-full text-sm border border-gray-100 rounded-xl px-4 py-2.5 bg-gray-50 text-gray-400">
                <Briefcase size={14} />
                {session.position ?? getRoleLabel(session.role)}
                <span className="ml-auto text-xs text-gray-300">Set by Admin</span>
              </div>
            </div>

            {profileError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <Check size={16} /> Profile updated successfully!
              </div>
            )}

            <button
              onClick={handleSaveProfile}
              disabled={profileSaving}
              className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-yellow-950 font-bold py-2.5 rounded-xl transition shadow-sm text-sm"
            >
              {profileSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Change Password Tab */}
      {tab === "password" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Shield size={18} className="text-yellow-500" />
            <h2 className="font-semibold text-gray-800">Change Password</h2>
          </div>

          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 pr-10 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:bg-white transition"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 pr-10 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:bg-white transition"
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength indicator */}
              {newPassword.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((level) => (
                      <div key={level} className={`h-1 flex-1 rounded-full transition-all ${strength >= level ? strengthColor[strength] : "bg-gray-200"}`} />
                    ))}
                  </div>
                  <p className={`text-xs mt-1 ${strength === 1 ? "text-red-500" : strength === 2 ? "text-yellow-600" : "text-green-600"}`}>
                    {strengthLabel[strength]}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className={`w-full text-sm border rounded-xl px-4 py-2.5 pr-10 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:bg-white transition ${confirmPassword && newPassword !== confirmPassword ? "border-red-300" : "border-gray-200"}`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <Check size={16} /> Password changed successfully! Please use your new password next time you log in.
              </div>
            )}

            <button
              onClick={handleChangePassword}
              disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
              className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-yellow-950 font-bold py-2.5 rounded-xl transition shadow-sm text-sm"
            >
              {passwordSaving ? "Updating..." : "Update Password"}
            </button>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs text-blue-700 font-medium mb-1">Security Tips</p>
              <ul className="text-xs text-blue-600 space-y-0.5">
                <li>• Use at least 8 characters</li>
                <li>• Mix letters, numbers and symbols</li>
                <li>• Never share your password with anyone</li>
                <li>• Change your password regularly</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
