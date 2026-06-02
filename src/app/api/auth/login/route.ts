import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { SignJWT } from "jose"
import { logAudit, getClientIp } from "@/lib/audit"
import { checkRateLimit, recordFailedAttempt, resetAttempts } from "@/lib/rateLimit"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "badranaya-secret-change-in-production"
)

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const userAgent = req.headers.get("user-agent") ?? "unknown"

  let body: { email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
  }

  const sanitizedEmail = email.trim().toLowerCase()

  // Rate limit by IP + email
  const rateLimitKey = `login:${ip}:${sanitizedEmail}`
  const { allowed, remainingAttempts, blockedUntilMs } = checkRateLimit(rateLimitKey)

  if (!allowed) {
    const blockedMinutes = blockedUntilMs
      ? Math.ceil((blockedUntilMs - Date.now()) / 60000)
      : 30

    await logAudit({
      userEmail: sanitizedEmail,
      action: "LOGIN_FAILED",
      resource: "auth",
      detail: `Account blocked due to too many failed attempts`,
      ipAddress: ip,
      userAgent,
      success: false,
    })

    return NextResponse.json(
      { error: `Too many failed attempts. Try again in ${blockedMinutes} minutes.` },
      { status: 429 }
    )
  }

  // Find user
  const user = await prisma.user.findUnique({ where: { email: sanitizedEmail } })

  if (!user || !user.isActive) {
    recordFailedAttempt(rateLimitKey)
    await logAudit({
      userEmail: sanitizedEmail,
      action: "LOGIN_FAILED",
      resource: "auth",
      detail: "User not found or inactive",
      ipAddress: ip,
      userAgent,
      success: false,
    })
    // Generic message — don't reveal if email exists
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  }

  // Verify password
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    const { blocked, remainingAttempts: remaining } = recordFailedAttempt(rateLimitKey)

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      action: "LOGIN_FAILED",
      resource: "auth",
      detail: `Wrong password. ${remaining} attempts remaining.`,
      ipAddress: ip,
      userAgent,
      success: false,
    })

    if (blocked) {
      return NextResponse.json(
        { error: "Too many failed attempts. Account temporarily locked for 30 minutes." },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: `Invalid email or password. ${remaining} attempts remaining.` },
      { status: 401 }
    )
  }

  // Success — reset rate limit
  resetAttempts(rateLimitKey)

  // Create JWT
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
    .setIssuedAt()
    .sign(JWT_SECRET)

  // Set secure cookie
  const cookieStore = await cookies()
  cookieStore.set("bp_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  })

  // Log successful login
  await logAudit({
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    userRole: user.role,
    action: "LOGIN",
    resource: "auth",
    detail: `Successful login`,
    ipAddress: ip,
    userAgent,
    success: true,
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
