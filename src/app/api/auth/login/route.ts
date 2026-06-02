import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { SignJWT } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "badranaya-secret-change-in-production"
)

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.isActive) {
    return NextResponse.json({ error: "Email atau password salah" }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return NextResponse.json({ error: "Email atau password salah" }, { status: 401 })
  }

  const token = await new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    position: user.position,
    targetBillableHoursMonthly: user.targetBillableHoursMonthly,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(JWT_SECRET)

  const cookieStore = await cookies()
  cookieStore.set("bp_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  })

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      position: user.position,
    },
  })
}
