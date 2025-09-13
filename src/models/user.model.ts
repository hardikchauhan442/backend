import { environment } from '@app/config';
import bcrypt from 'bcrypt';
import { pool } from '@app/config/db'; // your pg Pool

export async function createUserTable() {
  const sql = `
  CREATE TABLE IF NOT EXISTS "User" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    password TEXT NOT NULL,
    "isActive" BOOLEAN DEFAULT TRUE,
    "roleId" UUID REFERENCES permission(id) ON DELETE SET NULL ON UPDATE NO ACTION,
    "createdBy" UUID,
    "updatedBy" UUID,
    "deletedBy" UUID,
    "createdAt" TIMESTAMPTZ DEFAULT now(),
    "updatedAt" TIMESTAMPTZ DEFAULT now(),
    "deletedAt" TIMESTAMPTZ
  );
  `;
  await pool.query(sql);
}
