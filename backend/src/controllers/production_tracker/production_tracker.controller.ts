import { pool } from '@app/config/db';
import i18n from '@app/locales';
import { sendResponse } from '@app/middleware';
import { buildInsertQuery } from '@app/service/Add.service';
import { AuthenticatedRequest } from '@app/service/jwt.service';
import { ProductionTrackerCreate, ProductionTrackerUpdate } from '@app/types/interfaces/productionTracke';
import { NextFunction, Response } from 'express';
import { PoolClient } from 'pg';

export class ProductionTrackerController {
  _create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let client: PoolClient | undefined;
    try {
      client = await pool.connect();
      await client.query('BEGIN');
      const body: ProductionTrackerCreate = req.body.data;
      const reqUser = req?.user;
      if (reqUser) body.created_by = reqUser.id;
      const { text, values } = buildInsertQuery(
        'production_tracker',
        {
          job_id: body.job_id,
          status: body.status,
          description: body.description,
          created_by: body.created_by,
        },
        'id'
      );
      let jobId = await client.query(text, values);

      await client.query('COMMIT');
      return sendResponse(res, req, 200, i18n.__('created'), {});
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      next(error);
    } finally {
      client?.release();
    }
  };

  _list = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const status = req.query.status;
      const { rows } = await pool.query(
        `
SELECT 
  pt.id,
  pt.job_id,
  pt.status,
  pt.description,
  pt.updated_at,
  to_jsonb(jobs)
    || jsonb_build_object(
      'manufacturer', row_to_json(manufacturers),
      'materials',
      (
        SELECT json_agg(jm)
        FROM job_materials jm
        WHERE jm.job_id = jobs.id AND jm.deleted_at IS NULL
      )
    ) AS "jobData"
FROM production_tracker pt
JOIN jobs ON pt.job_id::uuid = jobs.id AND pt.deleted_at IS NULL
JOIN manufacturers ON jobs.manufacturer_id = manufacturers.id AND manufacturers."deletedAt" IS NULL
WHERE pt.deleted_at IS NULL
${status ? 'AND pt.status = $3' : ''}
LIMIT $1 OFFSET $2;
`,
        status ? [limit, offset, status] : [limit, offset]
      );
      return sendResponse(res, req, 200, i18n.__('getSuccess'), rows);
    } catch (error) {
      next(error);
    }
  };

  _update_status = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let client: PoolClient | undefined;
    try {
      client = await pool.connect();
      await client.query('BEGIN');
      const body: ProductionTrackerUpdate = req.body.data;
      console.log(body, 'body');

      const id = req.params.id;
      const reqUser = req?.user;
      if (reqUser) body.updated_by = reqUser.id;
      await client.query(`UPDATE production_tracker SET status = $1, updated_at = NOW(), updated_by = $2 WHERE job_id = $3 and deleted_at is null`, [
        body.status,
        req.user.id,
        id,
      ]);

      await client.query(`UPDATE jobs SET status = $1, updated_at = NOW(), updated_by = $2 WHERE id = $3 and deleted_at is null`, [
        body.status,
        req.user.id,
        id,
      ]);

      if (body.wastage_materials && body.wastage_materials.length > 0) {
        for (const item of body.wastage_materials) {
          const { text, values } = buildInsertQuery(
            'wastage_material',
            {
              job_id: id,
              material_type_id: item.material_type_id,
              material_name_id: item.material_name_id,
              quantity: item.quantity,
              weight: item.weight,
              notes: item.notes,
              created_by: req.user.id,
            },
            'id'
          );
          await client.query(text, values);
        }
      }
      if (body.return_materials) {
        if (body.return_materials && body.return_materials.length > 0) {
          for (const item of body.return_materials) {
            const { text, values } = buildInsertQuery(
              'returns_material',
              {
                job_id: id,
                material_type_id: item.material_type_id,
                material_name_id: item.material_name_id,
                quantity: item.quantity,
                weight: item.weight,
                notes: item.notes,
                created_by: req.user.id,
              },
              'id'
            );
            await client.query(text, values);
          }
        }
      }
      await client.query('COMMIT');
      return sendResponse(res, req, 200, i18n.__('updated'), {});
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      next(error);
    } finally {
      client?.release();
    }
  };
  _count = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const totalResult = await pool.query(`
        SELECT COUNT(*)::int AS total
        FROM production_tracker
        WHERE "deleted_at" IS NULL
      `);

      const total = totalResult.rows[0].total;

      const statusResult = await pool.query(`
        SELECT status, COUNT(*)::int AS count
        FROM production_tracker
        WHERE "deleted_at" IS NULL
        GROUP BY status
      `);

      // 3. Convert rows array to object
      const statusCounts: Record<string, number> = {};
      for (const row of statusResult.rows) {
        statusCounts[row.status] = row.count;
      }
      return sendResponse(res, req, 200, i18n.__('getSuccess'), { total, statusCounts });
    } catch (error) {
      next(error);
    }
  };
}
