import { pool } from '@app/config/db';

export async function createVendorsTable() {
  const sql = `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS "vendors" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "vendorName" TEXT NOT NULL,
    "vendorCode" TEXT UNIQUE NOT NULL,
    "contactPerson" TEXT,
    "contactNumber" TEXT,
    "email" TEXT,
    "website" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "countryId" INT REFERENCES countries(id) ON DELETE SET NULL,
    "stateId" INT REFERENCES states(id) ON DELETE SET NULL,
    "cityId" INT REFERENCES cities(id) ON DELETE SET NULL,
    "zipCode" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN DEFAULT TRUE,
    "createdBy" UUID,
    "updatedBy" UUID,
    "deletedBy" UUID,
    "createdAt" TIMESTAMPTZ DEFAULT now(),
    "updatedAt" TIMESTAMPTZ DEFAULT now(),
    "deletedAt" TIMESTAMPTZ
);`;
  await pool.query(sql);
}
