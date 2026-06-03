import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import BillingClient from "./BillingClient"

export default async function BillingPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  return <BillingClient session={session} />
}
