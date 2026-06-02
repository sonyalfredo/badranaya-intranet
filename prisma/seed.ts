import { PrismaClient } from "../src/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database...")

  const hashedPassword = await bcrypt.hash("badranaya2026", 10)

  // Users
  const partner = await prisma.user.upsert({
    where: { email: "partner@badranaya.com" },
    update: {},
    create: {
      name: "Sony Alfredo",
      email: "partner@badranaya.com",
      password: hashedPassword,
      role: "PARTNER",
      position: "Senior Partner",
      phone: "0812-0001-0001",
      targetBillableHoursMonthly: 120,
    },
  })

  const associate = await prisma.user.upsert({
    where: { email: "associate@badranaya.com" },
    update: {},
    create: {
      name: "Reza Firmansyah",
      email: "associate@badranaya.com",
      password: hashedPassword,
      role: "ASSOCIATE",
      position: "Senior Associate",
      phone: "0812-0002-0002",
      targetBillableHoursMonthly: 160,
    },
  })

  const paralegal = await prisma.user.upsert({
    where: { email: "paralegal@badranaya.com" },
    update: {},
    create: {
      name: "Siti Rahayu",
      email: "paralegal@badranaya.com",
      password: hashedPassword,
      role: "PARALEGAL",
      position: "Paralegal",
      targetBillableHoursMonthly: 140,
    },
  })

  const finance = await prisma.user.upsert({
    where: { email: "finance@badranaya.com" },
    update: {},
    create: {
      name: "Dewi Kusuma",
      email: "finance@badranaya.com",
      password: hashedPassword,
      role: "FINANCE",
      position: "Finance Manager",
      targetBillableHoursMonthly: 0,
    },
  })

  const admin = await prisma.user.upsert({
    where: { email: "admin@badranaya.com" },
    update: {},
    create: {
      name: "Andi Saputra",
      email: "admin@badranaya.com",
      password: hashedPassword,
      role: "ADMIN",
      position: "HR & Admin",
      targetBillableHoursMonthly: 0,
    },
  })

  // Clients
  const client1 = await prisma.client.upsert({
    where: { id: "client-mowilex" },
    update: {},
    create: {
      id: "client-mowilex",
      companyName: "PT Mowilex Indonesia",
      picName: "Budi Santoso",
      picEmail: "budi@mowilex.com",
      picPhone: "0812-3456-7890",
      industry: "Manufaktur Cat",
      status: "ACTIVE",
      createdBy: partner.id,
    },
  })

  const client2 = await prisma.client.upsert({
    where: { id: "client-sinarmas" },
    update: {},
    create: {
      id: "client-sinarmas",
      companyName: "PT Sinar Mas Group",
      picName: "Dewi Rahayu",
      picEmail: "dewi@sinarmas.com",
      industry: "Konglomerasi",
      status: "ACTIVE",
      createdBy: partner.id,
    },
  })

  // Matters
  const matter1 = await prisma.matter.upsert({
    where: { matterCode: "BP-2026-001" },
    update: {},
    create: {
      matterCode: "BP-2026-001",
      matterName: "Sengketa Merek Dagang",
      clientId: client1.id,
      practiceArea: "IP",
      lawyerInCharge: partner.id,
      status: "ACTIVE",
      description: "Sengketa merek dagang antara PT Mowilex vs kompetitor",
    },
  })

  const matter2 = await prisma.matter.upsert({
    where: { matterCode: "BP-2026-002" },
    update: {},
    create: {
      matterCode: "BP-2026-002",
      matterName: "Akuisisi PT Maju Bersama",
      clientId: client2.id,
      practiceArea: "CORPORATE",
      lawyerInCharge: partner.id,
      status: "ACTIVE",
      description: "Due diligence dan SPA untuk akuisisi PT Maju Bersama",
    },
  })

  // Time Entries
  await prisma.timeEntry.createMany({
    skipDuplicates: true,
    data: [
      {
        userId: associate.id,
        matterId: matter1.id,
        date: new Date("2026-06-02"),
        hours: 2.5,
        type: "BILLABLE",
        description: "Penyusunan memori kasasi dan penelitian yurisprudensi MA",
        status: "SUBMITTED",
      },
      {
        userId: associate.id,
        matterId: matter2.id,
        date: new Date("2026-06-02"),
        hours: 1.5,
        type: "BILLABLE",
        description: "Review SPA draft dan koordinasi dengan tim lawan",
        status: "APPROVED",
        approvedBy: partner.id,
        approvedAt: new Date(),
      },
      {
        userId: paralegal.id,
        matterId: matter1.id,
        date: new Date("2026-06-01"),
        hours: 3.0,
        type: "BILLABLE",
        description: "Sidang di PN Jakarta Pusat — pembuktian saksi ahli",
        status: "APPROVED",
        approvedBy: partner.id,
        approvedAt: new Date(),
      },
    ],
  })

  // Invoice
  await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-2026-001" },
    update: {},
    create: {
      matterId: matter1.id,
      invoiceNumber: "INV-2026-001",
      amount: 45000000,
      status: "SENT",
      dueDate: new Date("2026-06-30"),
    },
  })

  console.log("✅ Seed selesai!")
  console.log("")
  console.log("Akun login tersedia:")
  console.log("  Partner  : partner@badranaya.com")
  console.log("  Associate: associate@badranaya.com")
  console.log("  Paralegal: paralegal@badranaya.com")
  console.log("  Finance  : finance@badranaya.com")
  console.log("  Admin    : admin@badranaya.com")
  console.log("  Password : badranaya2026")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
