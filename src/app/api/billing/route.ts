import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!["PARTNER", "FINANCE"].includes(session.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const bills = await prisma.bill.findMany({
    include: {
      matter: { include: { client: { select: { companyName: true } } } },
      creator: { select: { name: true } },
      lineItems: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(bills)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!["PARTNER", "FINANCE"].includes(session.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const { matterId, periodStart, periodEnd, lineItems, subtotal, discount, otherCharges, notes } = body

  const count = await prisma.bill.count()
  const billNumber = `BILL-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`
  const total = subtotal - (discount ?? 0) + (otherCharges ?? 0)

  const bill = await prisma.bill.create({
    data: {
      matterId,
      billNumber,
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      subtotal,
      discount: discount ?? 0,
      otherCharges: otherCharges ?? 0,
      total,
      notes,
      createdBy: session.id,
      lineItems: {
        create: lineItems.map((item: any) => ({
          userId: item.userId,
          userName: item.userName,
          position: item.position,
          hours: item.hours,
          ratePerHour: item.ratePerHour,
          amount: item.amount,
        })),
      },
    },
    include: {
      matter: { include: { client: { select: { companyName: true } } } },
      lineItems: true,
    },
  })

  return NextResponse.json(bill, { status: 201 })
}
