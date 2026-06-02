import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSession } from "@/lib/session"
import { logAudit } from "@/lib/audit"

export async function POST(req: Request) {
  const session = await getSession()

  if (session) {
    await logAudit({
      userId: session.id,
      userEmail: session.email,
      userName: session.name,
      userRole: session.role,
      action: "LOGOUT",
      resource: "auth",
      detail: "User signed out",
      ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
    })
  }

  const cookieStore = await cookies()
  cookieStore.delete("bp_session")
  return NextResponse.json({ ok: true })
}
