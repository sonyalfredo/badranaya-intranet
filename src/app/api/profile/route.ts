import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"
import { cookies } from "next/headers"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "badranaya-secret-change-in-production"
)

// GET — fetch own profile
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true, name: true, email: true, role: true,
      position: true, phone: true, avatarUrl: true,
      targetBillableHoursMonthly: true, createdAt: true,
    },
  })

  return NextResponse.json(user)
}

// PATCH — update profile info
export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name, phone } = body

  if (!name?.trim())
    return NextResponse.json({ error: "Name is required" }, { status: 400 })

  const updated = await prisma.user.update({
    where: { id: session.id },
    data: { name: name.trim(), phone: phone?.trim() || null },
    select: { id: true, name: true, email: true, role: true, position: true, phone: true, targetBillableHoursMonthly: true },
  })

  // Re-issue JWT with updated name
  const token = await new SignJWT({
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    position: updated.position,
    targetBillableHoursMonthly: updated.targetBillableHoursMonthly,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .setIssuedAt()
    .sign(JWT_SECRET)

  const cookieStore = await cookies()
  cookieStore.set("bp_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  })

  return NextResponse.json(updated)
}
