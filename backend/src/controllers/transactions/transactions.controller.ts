import { sendResponse } from '@app/middleware';
import { AuthenticatedRequest } from '@app/service/jwt.service';
import { NextFunction, Response } from 'express';
import { pool } from '@app/config/db';
import i18n from '@app/locales';

export class TransactionController {
  _listStock = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      console.time('listStock');

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { rows } = await pool.query(
        `
   SELECT 
    rmt.material_type_id,
    m1.name AS material_type,
    m2.name AS material_name,
    SUM(
      CASE 
        WHEN rmt.transaction_type = 'IN' THEN rmt.quantity 
        WHEN rmt.transaction_type = 'OUT' THEN -rmt.quantity 
        ELSE 0 
      END
    ) AS total_quantity,
    SUM(
      CASE 
        WHEN rmt.transaction_type = 'IN' THEN rmt.weight 
        WHEN rmt.transaction_type = 'OUT' THEN -rmt.weight 
        ELSE 0 
      END
    ) AS total_weight,
     MAX(rmt.updated_at) AS last_updated_at
FROM raw_material_transactions rmt
LEFT JOIN master m1 ON rmt.material_type_id = m1.id and m1."deletedAt" IS NULL
LEFT JOIN master m2 ON rmt.material_name_id = m2.id and m2."deletedAt" IS NULL
WHERE rmt.deleted_at IS NULL
GROUP BY 
    rmt.material_type_id,
    rmt.material_name_id,
    m1.name,
    m2.name
ORDER BY rmt.material_type_id

LIMIT $1 OFFSET $2;
      `,
        [limit, offset]
      );

      const { rows: countRows } = await pool.query(
        `
          SELECT COUNT(*) AS total
          FROM raw_material_transactions rmt
          LEFT JOIN master m1 ON rmt.material_type_id = m1.id and m1."deletedAt" IS NULL
          LEFT JOIN master m2 ON rmt.material_name_id = m2.id and m2."deletedAt" IS NULL
          WHERE rmt.deleted_at IS NULL
          `
      );

      const total = countRows[0].total;
      console.timeEnd('listStock');
      return sendResponse(res, req, 200, i18n.__('getSuccess'), { rows, total, page, limit });
    } catch (error) {
      next(error);
    }
  };
  _listTransactions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { rows } = await pool.query(
        `
 SELECT
  rmt.*,
  m1.name AS material_type,
  m2.name AS material_name,
  m3.name AS unit,
  rm."vendorName" AS vendor_name
FROM raw_material_transactions rmt
JOIN master m1 ON rmt.material_type_id = m1.id
JOIN master m2 ON rmt.material_name_id = m2.id
JOIN master m3 ON rmt.unit_id = m3.id
LEFT JOIN (
  SELECT rmd.id, v."vendorName"
  FROM raw_materials rmd
  JOIN vendors v ON rmd.vendor_id = v.id
) rm ON rm.id = rmt.raw_material_id
WHERE rmt.deleted_at IS NULL
ORDER BY rmt.created_at ASC

LIMIT $1 OFFSET $2;

      `,
        [limit, offset]
      );

      const { rows: countRows } = await pool.query(
        `
          SELECT COUNT(*) AS total
          FROM raw_material_transactions rmt
          LEFT JOIN raw_materials rm ON rmt.material_type_id = rm.material_type_id
          LEFT JOIN vendors v ON rm.vendor_id = v.id
          WHERE rmt.deleted_at IS NULL
          `
      );
      const total = countRows[0].total;
      return sendResponse(res, req, 200, i18n.__('getSuccess'), { rows, total, page, limit });
    } catch (error) {
      next(error);
    }
  };
}
