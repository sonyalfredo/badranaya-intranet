import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!["PARTNER", "FINANCE"].includes(session.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const { status } = await req.json()

  const validStatuses = ["DRAFT", "SENT", "PAID", "OVERDUE"]
  if (!validStatuses.includes(status))
    return NextResponse.json({ error: "Status tidak valid" }, { status: 400 })

  const updated = await prisma.invoice.update({
    where: { id },
    data: {
      status,
      ...(status === "PAID" ? { paidAt: new Date() } : {}),
    },
    include: {
      matter: { include: { client: { select: { companyName: true } } } },
    },
  })

  return NextResponse.json(updated)
}
