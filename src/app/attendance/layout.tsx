import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import Sidebar from "@/components/layout/Sidebar"
import TopBar from "@/components/layout/TopBar"

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect("/login")
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar userRole={session.role} userName={session.name} userPosition={session.position} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar userName={session.name} userRole={session.role} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
