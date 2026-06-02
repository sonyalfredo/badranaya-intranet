import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!["PARTNER", "FINANCE"].includes(session.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const invoices = await prisma.invoice.findMany({
    include: {
      matter: {
        include: { client: { select: { companyName: true } } },
      },
    },
    orderBy: { issuedAt: "desc" },
  })

  return NextResponse.json(invoices)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!["PARTNER", "FINANCE"].includes(session.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const { matterId, amount, dueDate, notes } = body

  if (!matterId || !amount)
    return NextResponse.json({ error: "Matter dan jumlah wajib diisi" }, { status: 400 })

  const count = await prisma.invoice.count()
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`

  const invoice = await prisma.invoice.create({
    data: {
      matterId,
      invoiceNumber,
      amount: parseFloat(amount),
      dueDate: dueDate ? new Date(dueDate) : null,
      notes,
    },
    include: {
      matter: { include: { client: { select: { companyName: true } } } },
    },
  })

  return NextResponse.json(invoice, { status: 201 })
}
