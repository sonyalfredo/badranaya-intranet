import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import AdminClient from "./AdminClient"

export default async function AdminPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  return <AdminClient session={session} />
}
