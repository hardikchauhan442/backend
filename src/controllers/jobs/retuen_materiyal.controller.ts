import { pool } from '@app/config/db';
import i18n from '@app/locales';
import { sendResponse } from '@app/middleware';
import { buildInsertQuery } from '@app/service/Add.service';
import { AuthenticatedRequest } from '@app/service/jwt.service';
import { buildUpdateQueryById } from '@app/service/Update.service';
import { NextFunction, Response, Request } from 'express';
import { PoolClient } from 'pg';

export class ReturnMaterialController {
  _create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let client: PoolClient | undefined;
    try {
      client = await pool.connect();
      await client.query('BEGIN');
      const body = req.body.data;
      const reqUser = req?.user;
      if (reqUser) body.created_by = reqUser.id;

      const { text, values } = buildInsertQuery(
        'returns_material',
        {
          job_id: body.job_id,
          material_type_id: body.material_type_id,
          material_name_id: body.material_name_id,
          quantity: body.quantity,
          weight: body.weight,
          notes: body.notes,
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

  _updateStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let client: PoolClient | undefined;
    try {
      client = await pool.connect();
      await client.query('BEGIN');

      const body = req.body.data;
      const id = req.params.id;
      const reqUser = req?.user;
      if (reqUser) body.updated_by = reqUser.id;

      // update returns_material status
      const { text, values } = buildUpdateQueryById(
        'returns_material',
        id,
        {
          status: body.status,
          updated_by: body.updated_by,
        },
        'updated_at'
      );
      await client.query(text, values);

      // fetch the row you just updated
      const { rows } = await client.query(
        `SELECT wm.*, row_to_json(j) as job_data
         FROM returns_material wm
         LEFT JOIN jobs j ON wm.job_id = j.id AND j.deleted_at IS NULL
         WHERE wm.id = $1 AND wm.deleted_at IS NULL
         ORDER BY wm.created_at DESC`,
        [id]
      );

      if (rows.length === 0) {
        await client.query('ROLLBACK');
        return sendResponse(res, req, 404, i18n.__('notFound'), {});
      }

      if (body.status === 'Approved') {
        const r = rows[0]; // the actual row you just updated

        const { text: insertText, values: insertValues } = buildInsertQuery(
          'raw_material_transactions',
          {
            material_type_id: r.material_type_id,
            material_name_id: r.material_name_id,
            unit_id: null,
            transaction_type: 'IN',
            quantity: r.quantity,
            weight: r.weight,
            description: r.notes,
            job_id: r.job_id,
            manufacturer_id: r.job_data.manufacturer_id, // make sure this column exists in returns_material
            created_by: body.updated_by,
          },
          'id'
        );
        await client.query(insertText, insertValues);
      }

      await client.query('COMMIT');
      return sendResponse(res, req, 200, i18n.__('updateSuccess'), {});
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      next(error);
    } finally {
      client?.release();
    }
  };

  _list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 100;
      const offset = (page - 1) * limit;

      const { rows } = await pool.query(
        `SELECT rm.*, row_to_json(j) as job_data, row_to_json(m1) as material_type, row_to_json(m2) as material_name  FROM returns_material rm
        LEFT JOIN jobs j ON rm.job_id = j.id AND j."deleted_at" IS NULL
        LEFT JOIN master m1 ON rm.material_type_id = m1.id AND m1."deletedAt" IS NULL
        LEFT JOIN master m2 ON rm.material_name_id = m2.id AND m2."deletedAt" IS NULL
        WHERE rm."deleted_at" IS NULL 
        ORDER BY rm."created_at" DESC
        LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      return sendResponse(res, req, 200, i18n.__('success'), rows);
    } catch (error) {
      next(error);
    }
  };

  // _countUsingStatus = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const;
  //   } catch (error) {
  //     next(error);
  //   }
  // };
}
