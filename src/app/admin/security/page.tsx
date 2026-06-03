import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import SecurityClient from "./SecurityClient"

export default async function SecurityLogsPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  if (session.role !== "PARTNER") redirect("/dashboard")

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  })

  const stats = {
    totalLogins: await prisma.auditLog.count({ where: { action: "LOGIN", success: true } }),
    failedLogins: await prisma.auditLog.count({ where: { action: "LOGIN_FAILED" } }),
    blockedAttempts: await prisma.auditLog.count({ where: { action: "LOGIN_FAILED", detail: { contains: "blocked" } } }),
    activeToday: await prisma.auditLog.count({
      where: {
        action: "LOGIN",
        success: true,
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  }

  return <SecurityClient logs={logs} stats={stats} />
}
