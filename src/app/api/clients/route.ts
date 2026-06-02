import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search") ?? ""
  const status = searchParams.get("status")

  const clients = await prisma.client.findMany({
    where: {
      ...(search && {
        OR: [
          { companyName: { contains: search, mode: "insensitive" } },
          { picName: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(status && { status: status as any }),
    },
    include: {
      _count: { select: { matters: true } },
      matters: {
        where: { status: "ACTIVE" },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(clients)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!["PARTNER", "ASSOCIATE"].includes(session.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const { companyName, picName, picEmail, picPhone, industry, notes } = body

  if (!companyName || !picName)
    return NextResponse.json({ error: "Nama perusahaan dan PIC wajib diisi" }, { status: 400 })

  const client = await prisma.client.create({
    data: { companyName, picName, picEmail, picPhone, industry, notes, createdBy: session.id },
  })

  return NextResponse.json(client, { status: 201 })
}
