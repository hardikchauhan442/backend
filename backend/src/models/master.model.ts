import { pool } from '@app/config/db';
import { logger } from '@app/logger';

export async function createMasterTable() {
  // ensure pgcrypto is available for UUIDs

  const sql = `
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";

  CREATE TABLE IF NOT EXISTS master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    "isActive" BOOLEAN DEFAULT TRUE,
    "isDisplay" BOOLEAN DEFAULT TRUE,
    "parentId" UUID REFERENCES master(id) ON DELETE SET NULL ON UPDATE NO ACTION,
    "parentCode" TEXT,
    "likeKeyword" TEXT[],
    "imageUrl" TEXT,
    "isDefault" BOOLEAN DEFAULT FALSE,
    sequence INTEGER,
    "groupName" TEXT,
    "createdBy" UUID,
    "updatedBy" UUID,
    "deletedBy" UUID,
    "createdAt" TIMESTAMPTZ DEFAULT now(),
    "updatedAt" TIMESTAMPTZ DEFAULT now(),
    "deletedAt" TIMESTAMPTZ
  );
  `;
  logger.info('Done 👍  Creating master table if not exists...');
  await pool.query(sql);
}
