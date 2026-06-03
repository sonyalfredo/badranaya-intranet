import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

const ROMAN_MONTHS = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"]

const DOC_TYPE_LABELS: Record<string, string> = {
  LM: "Legal Memo",
  LO: "Legal Opinion",
  SK: "Surat Keluar",
  SM: "Surat Masuk",
  SOM: "Somasi",
  GUG: "Gugatan",
  PKS: "Perjanjian / Kontrak",
  SP: "Surat Pernyataan",
  DD: "Due Diligence Report",
  FA: "Internal Memo",
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()))
  const docType = searchParams.get("docType")
  const search = searchParams.get("search") ?? ""

  const docs = await prisma.documentNumber.findMany({
    where: {
      year,
      ...(docType && { docType: docType as any }),
      ...(search && {
        OR: [
          { fullNumber: { contains: search, mode: "insensitive" } },
          { subject: { contains: search, mode: "insensitive" } },
          { clientName: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    include: {
      requester: { select: { name: true, position: true } },
      matter: { select: { matterCode: true, matterName: true } },
    },
    orderBy: [{ docType: "asc" }, { sequence: "desc" }],
  })

  return NextResponse.json(docs)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { docType, subject, matterId, clientName, notes } = body

  if (!docType || !subject)
    return NextResponse.json({ error: "Document type and subject are required" }, { status: 400 })

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  // Get next sequence number for this docType in current year (reset every year)
  const lastDoc = await prisma.documentNumber.findFirst({
    where: { docType, year },
    orderBy: { sequence: "desc" },
  })

  const sequence = (lastDoc?.sequence ?? 0) + 1
  const paddedSeq = String(sequence).padStart(3, "0")
  const romanMonth = ROMAN_MONTHS[month - 1]
  const fullNumber = `${docType}/${paddedSeq}/BP/${romanMonth}/${year}`

  // Double-check uniqueness
  const exists = await prisma.documentNumber.findUnique({ where: { fullNumber } })
  if (exists)
    return NextResponse.json({ error: "Number already exists, please try again" }, { status: 409 })

  const doc = await prisma.documentNumber.create({
    data: {
      docType,
      sequence,
      year,
      month,
      fullNumber,
      subject,
      matterId: matterId || null,
      clientName: clientName || null,
      requestedBy: session.id,
      notes: notes || null,
    },
    include: {
      requester: { select: { name: true, position: true } },
      matter: { select: { matterCode: true, matterName: true } },
    },
  })

  return NextResponse.json(doc, { status: 201 })
}
