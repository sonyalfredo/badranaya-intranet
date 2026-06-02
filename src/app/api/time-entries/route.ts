import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const month = searchParams.get("month") // format: "2026-06"
  const userId = searchParams.get("userId") ?? session.id

  // Partner can view anyone; others can only view their own
  const targetUserId =
    session.role === "PARTNER" ? userId : session.id

  const startDate = month
    ? new Date(`${month}-01`)
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)

  const entries = await prisma.timeEntry.findMany({
    where: {
      userId: targetUserId,
      date: { gte: startDate, lte: endDate },
    },
    include: {
      matter: { include: { client: { select: { companyName: true } } } },
      user: { select: { name: true } },
      approver: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  })

  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { matterId, date, hours, type, description, status } = body

  if (!matterId || !date || !hours || !description)
    return NextResponse.json({ error: "Field wajib tidak lengkap" }, { status: 400 })

  const entry = await prisma.timeEntry.create({
    data: {
      userId: session.id,
      matterId,
      date: new Date(date),
      hours: parseFloat(hours),
      type: type ?? "BILLABLE",
      description,
      status: status ?? "DRAFT",
    },
    include: {
      matter: { include: { client: { select: { companyName: true } } } },
    },
  })

  return NextResponse.json(entry, { status: 201 })
}
