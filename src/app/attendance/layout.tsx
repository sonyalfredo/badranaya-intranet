import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import Sidebar from "@/components/layout/Sidebar"

export default async function AttendanceLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect("/login")
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userRole={session.role} userName={session.name} userPosition={session.position} />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">{children}</div>
      </main>
    </div>
  )
}
