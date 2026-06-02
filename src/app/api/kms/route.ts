import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search") ?? ""
  const category = searchParams.get("category")

  const articles = await prisma.kmsArticle.findMany({
    where: {
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
          { tags: { has: search } },
        ],
      }),
      ...(category && { category: category as any }),
    },
    include: { creator: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json(articles)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { title, category, content, tags, fileUrl } = body

  if (!title || !category || !content)
    return NextResponse.json({ error: "Title, category, and content are required" }, { status: 400 })

  const article = await prisma.kmsArticle.create({
    data: {
      title,
      category,
      content,
      tags: tags ?? [],
      fileUrl: fileUrl ?? null,
      createdBy: session.id,
    },
    include: { creator: { select: { name: true } } },
  })

  return NextResponse.json(article, { status: 201 })
}
