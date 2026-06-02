import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const isManager = session.role === "PARTNER" || session.role === "FINANCE"

  const reimbursements = await prisma.reimbursement.findMany({
    where: isManager ? {} : { userId: session.id },
    include: {
      user: { select: { name: true, position: true } },
      matter: { select: { matterCode: true, matterName: true } },
      reviewer: { select: { name: true } },
    },
    orderBy: { submittedAt: "desc" },
  })

  return NextResponse.json(reimbursements)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { matterId, category, amount, description, receiptUrl } = body

  if (!category || !amount || !description)
    return NextResponse.json({ error: "Field wajib tidak lengkap" }, { status: 400 })

  const reimbursement = await prisma.reimbursement.create({
    data: {
      userId: session.id,
      matterId: matterId || null,
      category,
      amount: parseFloat(amount),
      description,
      receiptUrl: receiptUrl || null,
    },
    include: {
      matter: { select: { matterCode: true, matterName: true } },
    },
  })

  return NextResponse.json(reimbursement, { status: 201 })
}
