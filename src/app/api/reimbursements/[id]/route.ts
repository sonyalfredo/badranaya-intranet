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
  const { action } = await req.json()

  const statusMap: Record<string, string> = {
    approve: "APPROVED",
    reject: "REJECTED",
    pay: "PAID",
  }

  if (!statusMap[action])
    return NextResponse.json({ error: "Action tidak valid" }, { status: 400 })

  const updated = await prisma.reimbursement.update({
    where: { id },
    data: {
      status: statusMap[action] as any,
      reviewedBy: session.id,
      reviewedAt: new Date(),
    },
    include: {
      user: { select: { name: true } },
    },
  })

  return NextResponse.json(updated)
}
