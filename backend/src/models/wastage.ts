import { pool } from '@app/config/db';

export async function createWastageReturnMaterialTable() {
  const sql = `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS wastage_material (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      job_id UUID REFERENCES jobs(id) ON DELETE CASCADE ON UPDATE NO ACTION,

      material_type_id UUID REFERENCES master(id) ON DELETE SET NULL ON UPDATE NO ACTION,
      material_name_id UUID REFERENCES master(id) ON DELETE SET NULL ON UPDATE NO ACTION,

      quantity INTEGER DEFAULT 0,
      weight NUMERIC DEFAULT 0,
      notes TEXT DEFAULT NULL,
      status VARCHAR(50) CHECK (status IN ('Pending','Approved','Rejected')) DEFAULT 'Pending',
      created_by UUID,
      updated_by UUID,
      deleted_by UUID,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      deleted_at TIMESTAMPTZ
    );

   CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS returns_material (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      job_id UUID REFERENCES jobs(id) ON DELETE CASCADE ON UPDATE NO ACTION,

      material_type_id UUID REFERENCES master(id) ON DELETE SET NULL ON UPDATE NO ACTION,
      material_name_id UUID REFERENCES master(id) ON DELETE SET NULL ON UPDATE NO ACTION,

      quantity INTEGER DEFAULT 0,
      weight NUMERIC DEFAULT 0,
      notes TEXT DEFAULT NULL,
      status VARCHAR(50) CHECK (status IN ('Pending','Approved','Rejected')) DEFAULT 'Pending',
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
