import { pool } from '@app/config/db';

export const createRawMaterialTransactionsTable = async () => {
  const sql = `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS raw_material_transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      raw_material_id UUID REFERENCES raw_materials(id) ON DELETE SET NULL ON UPDATE NO ACTION,
      job_id UUID REFERENCES jobs(id) ON DELETE SET NULL ON UPDATE NO ACTION,
      job_materials_id UUID REFERENCES job_materials(id) ON DELETE SET NULL ON UPDATE NO ACTION,
      material_type_id UUID REFERENCES master(id) ON DELETE SET NULL ON UPDATE NO ACTION,
      material_name_id UUID REFERENCES master(id) ON DELETE SET NULL ON UPDATE NO ACTION,
      unit_id UUID REFERENCES master(id) ON DELETE SET NULL ON UPDATE NO ACTION,
      transaction_type TEXT NOT NULL,
      quantity INTEGER DEFAULT 0,
      weight NUMERIC DEFAULT 0,
      description TEXT,
      vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL ON UPDATE NO ACTION,
      manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE SET NULL ON UPDATE NO ACTION,
      created_by UUID,
      updated_by UUID,
      deleted_by UUID,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      deleted_at TIMESTAMPTZ
    );
  `;
  await pool.query(sql);
};
