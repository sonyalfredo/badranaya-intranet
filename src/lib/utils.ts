import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    PARTNER: "Partner",
    ASSOCIATE: "Associate",
    PARALEGAL: "Paralegal",
    FINANCE: "Finance",
    ADMIN: "Admin / HR",
  }
  return labels[role] ?? role
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    SUBMITTED: "bg-blue-100 text-blue-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    PAID: "bg-green-100 text-green-700",
    OVERDUE: "bg-red-100 text-red-700",
    SENT: "bg-blue-100 text-blue-700",
    ACTIVE: "bg-green-100 text-green-700",
    INACTIVE: "bg-gray-100 text-gray-700",
    ON_HOLD: "bg-yellow-100 text-yellow-700",
    CLOSED: "bg-gray-100 text-gray-700",
    BILLED: "bg-purple-100 text-purple-700",
  }
  return colors[status] ?? "bg-gray-100 text-gray-700"
}

export function getBillableProgressColor(percentage: number): string {
  if (percentage >= 90) return "text-green-600"
  if (percentage >= 70) return "text-yellow-600"
  return "text-red-600"
}
