import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const month = searchParams.get("month")
  const userId = searchParams.get("userId") ?? session.id

  const targetUserId =
    session.role === "PARTNER" || session.role === "ADMIN" ? userId : session.id

  const startDate = month
    ? new Date(`${month}-01`)
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)

  const records = await prisma.attendance.findMany({
    where: {
      userId: targetUserId,
      date: { gte: startDate, lte: endDate },
    },
    include: { user: { select: { name: true } } },
    orderBy: { date: "desc" },
  })

  return NextResponse.json(records)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { action, type, notes } = body // action: "checkin" | "checkout"

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const existing = await prisma.attendance.findUnique({
    where: { userId_date: { userId: session.id, date: today } },
  })

  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown"

  if (action === "checkin") {
    if (existing?.checkInAt)
      return NextResponse.json({ error: "Sudah check-in hari ini" }, { status: 400 })

    const record = existing
      ? await prisma.attendance.update({
          where: { id: existing.id },
          data: { checkInAt: new Date(), ipAddress: ip, type: type ?? "WFO" },
        })
      : await prisma.attendance.create({
          data: {
            userId: session.id,
            date: today,
            checkInAt: new Date(),
            ipAddress: ip,
            type: type ?? "WFO",
            notes,
          },
        })
    return NextResponse.json(record)
  }

  if (action === "checkout") {
    if (!existing?.checkInAt)
      return NextResponse.json({ error: "Belum check-in hari ini" }, { status: 400 })
    if (existing.checkOutAt)
      return NextResponse.json({ error: "Sudah check-out hari ini" }, { status: 400 })

    const record = await prisma.attendance.update({
      where: { id: existing.id },
      data: { checkOutAt: new Date() },
    })
    return NextResponse.json(record)
  }

  return NextResponse.json({ error: "Action tidak valid" }, { status: 400 })
}
