import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const matters = await prisma.matter.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { lawyerInCharge: session.id },
        { team: { some: { userId: session.id } } },
        ...(session.role === "PARTNER" ? [{}] : []),
      ],
    },
    include: {
      client: { select: { companyName: true } },
      lawyer: { select: { name: true } },
    },
    orderBy: { openedAt: "desc" },
  })

  return NextResponse.json(matters)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!["PARTNER", "ASSOCIATE"].includes(session.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const { matterName, clientId, practiceArea, description } = body

  if (!matterName || !clientId || !practiceArea)
    return NextResponse.json({ error: "Field wajib tidak lengkap" }, { status: 400 })

  const count = await prisma.matter.count()
  const matterCode = `BP-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`

  const matter = await prisma.matter.create({
    data: {
      matterCode,
      matterName,
      clientId,
      practiceArea,
      lawyerInCharge: session.id,
      description,
    },
    include: { client: true },
  })

  return NextResponse.json(matter, { status: 201 })
}
