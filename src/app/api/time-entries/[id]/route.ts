import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { action, note } = body // action: "approve" | "reject" | "submit"

  const entry = await prisma.timeEntry.findUnique({ where: { id } })
  if (!entry) return NextResponse.json({ error: "Entry tidak ditemukan" }, { status: 404 })

  if (action === "submit") {
    if (entry.userId !== session.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const updated = await prisma.timeEntry.update({
      where: { id },
      data: { status: "SUBMITTED" },
    })
    return NextResponse.json(updated)
  }

  if (action === "approve" || action === "reject") {
    if (session.role !== "PARTNER")
      return NextResponse.json({ error: "Hanya Partner yang dapat approve" }, { status: 403 })

    const updated = await prisma.timeEntry.update({
      where: { id },
      data: {
        status: action === "approve" ? "APPROVED" : "REJECTED",
        approvedBy: session.id,
        approvedAt: new Date(),
        rejectionNote: action === "reject" ? note : null,
      },
    })

    await prisma.timeEntryApproval.create({
      data: {
        timeEntryId: id,
        reviewedBy: session.id,
        action,
        note,
      },
    })

    return NextResponse.json(updated)
  }

  return NextResponse.json({ error: "Action tidak valid" }, { status: 400 })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const entry = await prisma.timeEntry.findUnique({ where: { id } })

  if (!entry) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 })
  if (entry.userId !== session.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (entry.status !== "DRAFT")
    return NextResponse.json({ error: "Hanya draft yang dapat dihapus" }, { status: 400 })

  await prisma.timeEntry.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
