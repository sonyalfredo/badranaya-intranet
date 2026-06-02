import { cookies } from "next/headers"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "badranaya-secret-change-in-production"
)

export interface SessionUser {
  id: string
  name: string
  email: string
  role: string
  position?: string
  targetBillableHoursMonthly: number
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("bp_session")?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as SessionUser
  } catch {
    return null
  }
}
