import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!["PARTNER", "FINANCE"].includes(session.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { matterId, periodStart, periodEnd } = await req.json()

  if (!matterId || !periodStart || !periodEnd)
    return NextResponse.json({ error: "Matter and period are required" }, { status: 400 })

  // Get approved time entries for this matter in the period
  const entries = await prisma.timeEntry.findMany({
    where: {
      matterId,
      status: "APPROVED",
      type: "BILLABLE",
      date: {
        gte: new Date(periodStart),
        lte: new Date(periodEnd),
      },
    },
    include: {
      user: { select: { id: true, name: true, position: true } },
    },
  })

  // Get billing rates
  const rates = await prisma.billingRate.findMany()
  const rateMap = Object.fromEntries(rates.map((r) => [r.position, r.ratePerHour]))

  // Group by user and calculate
  const userMap = new Map<string, { userId: string; userName: string; position: string; hours: number; ratePerHour: number; amount: number }>()

  for (const entry of entries) {
    const position = entry.user.position ?? "Associate"
    const rate = rateMap[position] ?? 1500000
    const key = entry.userId

    if (userMap.has(key)) {
      const existing = userMap.get(key)!
      existing.hours += entry.hours
      existing.amount += entry.hours * rate
    } else {
      userMap.set(key, {
        userId: entry.userId,
        userName: entry.user.name,
        position,
        hours: entry.hours,
        ratePerHour: rate,
        amount: entry.hours * rate,
      })
    }
  }

  const lineItems = Array.from(userMap.values())
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)

  // Get matter details
  const matter = await prisma.matter.findUnique({
    where: { id: matterId },
    include: { client: { select: { companyName: true } } },
  })

  return NextResponse.json({
    matter,
    periodStart,
    periodEnd,
    lineItems,
    subtotal,
    totalEntries: entries.length,
  })
}
