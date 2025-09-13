import { pool } from '@app/config/db'; // your pg Pool

export async function createRawMaterialTable() {
  const sql = `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS raw_materials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      material_name_id UUID REFERENCES master(id) ON DELETE SET NULL ON UPDATE NO ACTION,
      material_type_id UUID REFERENCES master(id) ON DELETE SET NULL ON UPDATE NO ACTION,
      unit_id UUID REFERENCES master(id) ON DELETE SET NULL ON UPDATE NO ACTION,
      quantity INTEGER DEFAULT 0,
      weight NUMERIC DEFAULT 0,
      status NUMERIC,
      description TEXT,
      vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL ON UPDATE NO ACTION,
      is_active BOOLEAN DEFAULT TRUE,
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
