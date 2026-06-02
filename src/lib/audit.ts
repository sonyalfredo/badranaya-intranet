import { prisma } from "./prisma"

export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "LOGIN_FAILED"
  | "VIEW"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "EXPORT"
  | "DOWNLOAD"

export interface AuditParams {
  userId?: string
  userEmail?: string
  userName?: string
  userRole?: string
  action: AuditAction
  resource: string
  resourceId?: string
  detail?: string
  ipAddress?: string
  userAgent?: string
  success?: boolean
}

export async function logAudit(params: AuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        userEmail: params.userEmail,
        userName: params.userName,
        userRole: params.userRole,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
        detail: params.detail,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        success: params.success ?? true,
      },
    })
  } catch (e) {
    // Never let audit logging crash the main request
    console.error("Audit log failed:", e)
  }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  const real = req.headers.get("x-real-ip")
  if (forwarded) return forwarded.split(",")[0].trim()
  if (real) return real
  return "unknown"
}
