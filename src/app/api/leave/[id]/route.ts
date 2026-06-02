import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!["PARTNER", "ADMIN"].includes(session.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const { action, note } = await req.json()

  const updated = await prisma.leaveRequest.update({
    where: { id },
    data: {
      status: action === "approve" ? "APPROVED" : "REJECTED",
      approvedBy: session.id,
      approvedAt: new Date(),
      rejectNote: action === "reject" ? note : null,
    },
    include: { user: { select: { name: true } } },
  })

  return NextResponse.json(updated)
}
