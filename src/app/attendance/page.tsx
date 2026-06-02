import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import AttendanceClient from "./AttendanceClient"

export default async function AttendancePage() {
  const session = await getSession()
  if (!session) redirect("/login")
  return <AttendanceClient session={session} />
}
