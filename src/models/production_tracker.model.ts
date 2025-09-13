import { pool } from '@app/config/db';

export async function createProductionTrackerTable() {
  const sql = `
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";

  CREATE TABLE IF NOT EXISTS production_tracker (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id TEXT NOT NULL,
    status VARCHAR(50) CHECK (status IN ('Pending','In Progress','Completed','On Hold','Qc', 'Cancelled')) DEFAULT 'Pending',
    description TEXT DEFAULT NULL,
    created_by UUID,
    updated_by UUID,
    deleted_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
  );
  `;

  await pool.query(sql);
}
