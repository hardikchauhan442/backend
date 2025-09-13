import { pool } from '@app/config/db';

export const createJobsTable = async () => {
  const sql = `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS "jobs" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name VARCHAR(255) NOT NULL,
    job_code VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    priority VARCHAR(50) CHECK (priority IN ('Low','Medium','High')),
    due_date DATE,
    cost_estimate NUMERIC(12,2),
    manufacturer_id UUID REFERENCES manufacturers(id),
    job_description TEXT,
    special_instructions TEXT,
    file_path TEXT,
    status VARCHAR(50) CHECK (status IN ('Pending','In Progress','Completed','On Hold','Qc', 'Cancelled')) DEFAULT 'Pending',
    created_by UUID,
    updated_by UUID,
    deleted_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);
    CREATE TABLE IF NOT EXISTS job_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    material_type_id UUID REFERENCES master(id) ON DELETE SET NULL ON UPDATE NO ACTION,
    material_name_id UUID REFERENCES master(id) ON DELETE SET NULL ON UPDATE NO ACTION,
    quantity INTEGER DEFAULT 0,
    weight NUMERIC DEFAULT 0,
    unit_id UUID REFERENCES master(id) ON DELETE SET NULL ON UPDATE NO ACTION,
    notes TEXT,
    material_cost NUMERIC(12,2) DEFAULT 0,
    created_by UUID,
    updated_by UUID,
    deleted_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);`;
  await pool.query(sql);
};
