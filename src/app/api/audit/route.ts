import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.role !== "PARTNER")
    return NextResponse.json({ error: "Access restricted to Partners only" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get("limit") ?? "100")
  const action = searchParams.get("action")
  const userId = searchParams.get("userId")

  const logs = await prisma.auditLog.findMany({
    where: {
      ...(action && { action }),
      ...(userId && { userId }),
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 500),
  })

  return NextResponse.json(logs)
}
