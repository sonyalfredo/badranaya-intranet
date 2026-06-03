import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

// Default rates — seeded on first GET if empty
const DEFAULT_RATES = [
  { position: "Managing Partner", ratePerHour: 5000000 },
  { position: "Partner",          ratePerHour: 5000000 },
  { position: "Associate",        ratePerHour: 3000000 },
  { position: "Junior Associate", ratePerHour: 2000000 },
  { position: "Trainee Associate",ratePerHour: 1500000 },
]

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let rates = await prisma.billingRate.findMany({ orderBy: { ratePerHour: "desc" } })

  // Auto-seed defaults if empty
  if (rates.length === 0) {
    await prisma.billingRate.createMany({ data: DEFAULT_RATES })
    rates = await prisma.billingRate.findMany({ orderBy: { ratePerHour: "desc" } })
  }

  return NextResponse.json(rates)
}

export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.role !== "PARTNER")
    return NextResponse.json({ error: "Only Partners can update billing rates" }, { status: 403 })

  const rates: { position: string; ratePerHour: number }[] = await req.json()

  const updated = await Promise.all(
    rates.map((r) =>
      prisma.billingRate.upsert({
        where: { position: r.position },
        update: { ratePerHour: r.ratePerHour, updatedBy: session.id },
        create: { position: r.position, ratePerHour: r.ratePerHour, updatedBy: session.id },
      })
    )
  )

  return NextResponse.json(updated)
}
