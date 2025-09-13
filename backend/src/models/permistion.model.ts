import { pool } from '@app/config/db';

export async function createPermissionTable() {
  // ensure pgcrypto for UUIDs

  const sql = `
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";

  CREATE TABLE IF NOT EXISTS permission (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "role_name" TEXT NOT NULL,
    permission JSONB[] NOT NULL,
    "description" TEXT DEFAULT NULL,
    "isActive" BOOLEAN DEFAULT TRUE,
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
