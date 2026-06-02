import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import TimesheetClient from "./TimesheetClient"

export default async function TimesheetPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  if (session.role === "FINANCE" || session.role === "ADMIN") redirect("/dashboard")

  return <TimesheetClient session={session} />
}
