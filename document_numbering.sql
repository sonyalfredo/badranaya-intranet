-- Document Numbering System

CREATE TYPE "DocType" AS ENUM ('LM','LO','SK','SM','SOM','GUG','PKS','SP','DD','FA');

CREATE TABLE IF NOT EXISTS "DocumentNumber" (
    "id" TEXT NOT NULL,
    "docType" "DocType" NOT NULL,
    "sequence" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "fullNumber" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "matterId" TEXT,
    "clientName" TEXT,
    "requestedBy" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocumentNumber_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "DocumentNumber_fullNumber_key" ON "DocumentNumber"("fullNumber");
CREATE INDEX IF NOT EXISTS "DocumentNumber_docType_idx" ON "DocumentNumber"("docType");
CREATE INDEX IF NOT EXISTS "DocumentNumber_year_idx" ON "DocumentNumber"("year");
CREATE INDEX IF NOT EXISTS "DocumentNumber_requestedBy_idx" ON "DocumentNumber"("requestedBy");

ALTER TABLE "DocumentNumber" ADD CONSTRAINT "DocumentNumber_matterId_fkey" 
  FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DocumentNumber" ADD CONSTRAINT "DocumentNumber_requestedBy_fkey" 
  FOREIGN KEY ("requestedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
