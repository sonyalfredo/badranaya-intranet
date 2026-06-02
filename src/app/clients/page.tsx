import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import ClientsClient from "./ClientsClient"

export default async function ClientsPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  return <ClientsClient session={session} />
}
