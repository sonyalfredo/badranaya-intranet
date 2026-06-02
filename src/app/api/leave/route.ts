import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const isManager = session.role === "PARTNER" || session.role === "ADMIN"

  const requests = await prisma.leaveRequest.findMany({
    where: isManager ? {} : { userId: session.id },
    include: {
      user: { select: { name: true, position: true } },
      approver: { select: { name: true } },
    },
    orderBy: { submittedAt: "desc" },
  })

  return NextResponse.json(requests)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { type, startDate, endDate, reason } = body

  if (!type || !startDate || !endDate || !reason)
    return NextResponse.json({ error: "Field wajib tidak lengkap" }, { status: 400 })

  const request = await prisma.leaveRequest.create({
    data: {
      userId: session.id,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
    },
  })

  return NextResponse.json(request, { status: 201 })
}
