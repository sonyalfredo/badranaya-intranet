import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { supabaseAdmin } from "@/lib/supabase"

const MAX_SIZE_MB = 5
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"]

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

  if (!ALLOWED_TYPES.includes(file.type))
    return NextResponse.json({ error: "Only JPG, PNG, WEBP, or PDF allowed" }, { status: 400 })

  if (file.size > MAX_SIZE_MB * 1024 * 1024)
    return NextResponse.json({ error: `File too large. Max ${MAX_SIZE_MB}MB` }, { status: 400 })

  const ext = file.name.split(".").pop()
  const fileName = `${session.id}/${Date.now()}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { data, error } = await supabaseAdmin.storage
    .from("receipts")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed: " + error.message }, { status: 500 })
  }

  // Generate signed URL valid for 1 year
  const { data: signedData } = await supabaseAdmin.storage
    .from("receipts")
    .createSignedUrl(data.path, 60 * 60 * 24 * 365)

  return NextResponse.json({
    path: data.path,
    url: signedData?.signedUrl ?? "",
  })
}
