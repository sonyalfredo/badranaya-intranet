export type Role = "PARTNER" | "ASSOCIATE" | "PARALEGAL" | "FINANCE" | "ADMIN"

export type TimeEntryStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED"
export type TimeEntryType = "BILLABLE" | "NON_BILLABLE"
export type MatterStatus = "ACTIVE" | "ON_HOLD" | "CLOSED" | "BILLED"
export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE"
export type ReimbursementStatus = "PENDING" | "APPROVED" | "REJECTED" | "PAID"
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED"
export type ClientStatus = "ACTIVE" | "INACTIVE" | "PROSPECT"

export interface User {
  id: string
  name: string
  email: string
  role: Role
  position?: string
  phone?: string
  avatarUrl?: string
  targetBillableHoursMonthly: number
  isActive: boolean
}

export interface Client {
  id: string
  companyName: string
  picName: string
  picEmail?: string
  picPhone?: string
  industry?: string
  status: ClientStatus
  notes?: string
  createdAt: string
}

export interface Matter {
  id: string
  matterCode: string
  matterName: string
  clientId: string
  client?: Client
  practiceArea: string
  lawyerInCharge: string
  lawyer?: User
  status: MatterStatus
  description?: string
  openedAt: string
}

export interface TimeEntry {
  id: string
  userId: string
  user?: User
  matterId: string
  matter?: Matter
  date: string
  hours: number
  type: TimeEntryType
  description: string
  status: TimeEntryStatus
  approvedBy?: string
  approver?: User
  approvedAt?: string
  rejectionNote?: string
  timerStartedAt?: string
  createdAt: string
}

export interface Attendance {
  id: string
  userId: string
  date: string
  checkInAt?: string
  checkOutAt?: string
  ipAddress?: string
  type: string
  notes?: string
}

export interface LeaveRequest {
  id: string
  userId: string
  user?: User
  type: string
  startDate: string
  endDate: string
  reason: string
  status: LeaveStatus
  approvedBy?: string
  submittedAt: string
}

export interface Invoice {
  id: string
  matterId: string
  matter?: Matter
  invoiceNumber: string
  amount: number
  status: InvoiceStatus
  dueDate?: string
  issuedAt: string
  paidAt?: string
}

export interface Reimbursement {
  id: string
  userId: string
  user?: User
  matterId?: string
  matter?: Matter
  category: string
  amount: number
  description: string
  receiptUrl?: string
  status: ReimbursementStatus
  submittedAt: string
}

export interface KmsArticle {
  id: string
  title: string
  category: string
  content: string
  fileUrl?: string
  tags: string[]
  createdBy: string
  creator?: User
  createdAt: string
  updatedAt: string
}
