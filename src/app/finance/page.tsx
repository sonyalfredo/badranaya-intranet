import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import FinanceClient from "./FinanceClient"

export default async function FinancePage() {
  const session = await getSession()
  if (!session) redirect("/login")
  if (!["PARTNER", "FINANCE", "ASSOCIATE", "PARALEGAL"].includes(session.role))
    redirect("/dashboard")
  return <FinanceClient session={session} />
}
