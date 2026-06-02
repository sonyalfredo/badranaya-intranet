import { PrismaClient } from "../src/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding Badranaya Partnership employees...")

  const defaultPassword = await bcrypt.hash("badranaya2026", 10)

  const employees = [
    // Partners
    {
      name: "Bhirawa Jayasidayatra Arifi",
      email: "bhirawa@badranayalaw.com",
      role: "PARTNER" as const,
      position: "Managing Partner",
      phone: "081286931853",
      targetBillableHoursMonthly: 100,
    },
    {
      name: "Mangatta Toding Allo",
      email: "mangatta@badranayalaw.com",
      role: "PARTNER" as const,
      position: "Partner",
      phone: "081182297721",
      targetBillableHoursMonthly: 120,
    },
    {
      name: "Sony Hutahaean",
      email: "sony.hutahaean@badranayalaw.com",
      role: "PARTNER" as const,
      position: "Partner",
      phone: "081317524810",
      targetBillableHoursMonthly: 120,
    },
    // Associates
    {
      name: "Ardi Syahwal",
      email: "asyahwal@badranayalaw.com",
      role: "ASSOCIATE" as const,
      position: "Associate",
      phone: "085265749999",
      targetBillableHoursMonthly: 160,
    },
    {
      name: "David Kurniawan Bengu",
      email: "dbengu@badranayalaw.com",
      role: "ASSOCIATE" as const,
      position: "Associate",
      phone: "082247589420",
      targetBillableHoursMonthly: 160,
    },
    {
      name: "Jordy Herry Christian",
      email: "jchristian@badranayalaw.com",
      role: "ASSOCIATE" as const,
      position: "Associate",
      phone: "081283549827",
      targetBillableHoursMonthly: 160,
    },
    {
      name: "Muhammad Rizki Syaputra",
      email: "msyaputra@badranayalaw.com",
      role: "ASSOCIATE" as const,
      position: "Associate",
      phone: "082253041471",
      targetBillableHoursMonthly: 160,
    },
    {
      name: "Christian Tarihoran",
      email: "ctarihoran@badranayalaw.com",
      role: "ASSOCIATE" as const,
      position: "Associate",
      phone: "082183548202",
      targetBillableHoursMonthly: 160,
    },
    // Junior Associates
    {
      name: "Euginia Gozali",
      email: "egozali@badranayalaw.com",
      role: "ASSOCIATE" as const,
      position: "Junior Associate",
      phone: "087868380909",
      targetBillableHoursMonthly: 140,
    },
    {
      name: "Maria Dorothy Yustika Pasaribu",
      email: "mpasaribu@badranayalaw.com",
      role: "ASSOCIATE" as const,
      position: "Junior Associate",
      phone: "085791320266",
      targetBillableHoursMonthly: 140,
    },
    {
      name: "Aura Puteri Negeri",
      email: "anegeri@badranayalaw.com",
      role: "ASSOCIATE" as const,
      position: "Junior Associate",
      phone: "082113313533",
      targetBillableHoursMonthly: 140,
    },
    // Trainee Associates
    {
      name: "Nabila Aliya Nilasari",
      email: "nnilasari@badranayalaw.com",
      role: "PARALEGAL" as const,
      position: "Trainee Associate",
      phone: "081316358236",
      targetBillableHoursMonthly: 120,
    },
    {
      name: "Ziddan Abulauni Mardias",
      email: "zmardias@badranayalaw.com",
      role: "PARALEGAL" as const,
      position: "Trainee Associate",
      phone: "081803631365",
      targetBillableHoursMonthly: 120,
    },
    {
      name: "Sardis Pata'dungan",
      email: "spatadungan@badranayalaw.com",
      role: "PARALEGAL" as const,
      position: "Trainee Associate",
      phone: "082346237346",
      targetBillableHoursMonthly: 120,
    },
    {
      name: "Devina Melosia Mangiwa",
      email: "dmangiwa@badranayalaw.com",
      role: "PARALEGAL" as const,
      position: "Trainee Associate",
      phone: "081225391988",
      targetBillableHoursMonthly: 120,
    },
    {
      name: "Donita Amilia",
      email: "damilia@badranayalaw.com",
      role: "PARALEGAL" as const,
      position: "Trainee Associate",
      phone: "082331097226",
      targetBillableHoursMonthly: 120,
    },
    {
      name: "MHD Dandy Saputra",
      email: "msaputra@badranayalaw.com",
      role: "PARALEGAL" as const,
      position: "Trainee Associate",
      phone: "08117238384",
      targetBillableHoursMonthly: 120,
    },
  ]

  let created = 0
  let skipped = 0

  for (const emp of employees) {
    const existing = await prisma.user.findUnique({ where: { email: emp.email } })
    if (existing) {
      // Update existing with real data
      await prisma.user.update({
        where: { email: emp.email },
        data: {
          name: emp.name,
          role: emp.role,
          position: emp.position,
          phone: emp.phone,
          targetBillableHoursMonthly: emp.targetBillableHoursMonthly,
        },
      })
      skipped++
    } else {
      await prisma.user.create({
        data: {
          ...emp,
          password: defaultPassword,
          isActive: true,
        },
      })
      created++
    }
  }

  console.log(`✅ Done! Created: ${created}, Updated: ${skipped}`)
  console.log("")
  console.log("All accounts (password: badranaya2026):")
  console.log("")
  console.log("PARTNERS:")
  console.log("  bhirawa@badranayalaw.com       — Managing Partner")
  console.log("  mangatta@badranayalaw.com      — Partner")
  console.log("  sony.hutahaean@badranayalaw.com — Partner")
  console.log("")
  console.log("ASSOCIATES:")
  console.log("  asyahwal@badranayalaw.com")
  console.log("  dbengu@badranayalaw.com")
  console.log("  jchristian@badranayalaw.com")
  console.log("  msyaputra@badranayalaw.com")
  console.log("  ctarihoran@badranayalaw.com")
  console.log("  egozali@badranayalaw.com       — Junior Associate")
  console.log("  mpasaribu@badranayalaw.com     — Junior Associate")
  console.log("  anegeri@badranayalaw.com       — Junior Associate")
  console.log("")
  console.log("TRAINEE ASSOCIATES:")
  console.log("  nnilasari@badranayalaw.com")
  console.log("  zmardias@badranayalaw.com")
  console.log("  spatadungan@badranayalaw.com")
  console.log("  dmangiwa@badranayalaw.com")
  console.log("  damilia@badranayalaw.com")
  console.log("  msaputra@badranayalaw.com")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
