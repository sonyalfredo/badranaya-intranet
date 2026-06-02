import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import KmsClient from "./KmsClient"

export default async function KmsPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  return <KmsClient session={session} />
}
