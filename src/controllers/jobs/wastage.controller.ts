import { pool } from '@app/config/db';
import i18n from '@app/locales';
import { sendResponse } from '@app/middleware';
import { buildInsertQuery } from '@app/service/Add.service';
import { AuthenticatedRequest } from '@app/service/jwt.service';
import { buildUpdateQueryById } from '@app/service/Update.service';
import { NextFunction, Response, Request } from 'express';
import { PoolClient } from 'pg';

export class WastageController {
  _create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let client: PoolClient | undefined;
    try {
      client = await pool.connect();
      await client.query('BEGIN');
      const body = req.body.data;
      const reqUser = req?.user;
      if (reqUser) body.created_by = reqUser.id;

      const { text, values } = buildInsertQuery(
        'wastage_material',
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
      const { id } = req.params;
      const body = req.body.data;
      const reqUser = req?.user;
      if (reqUser) body.updated_by = reqUser.id;

      const { text, values } = buildUpdateQueryById(
        'wastage_material',
        id,
        {
          status: body.status,
          updated_by: body.updated_by,
        },
        'updated_at'
      );
      await client.query(text, values);
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
        `SELECT wm.*, row_to_json(j) as job_data, row_to_json(m1) as material_type, row_to_json(m2) as material_name  FROM wastage_material wm
        LEFT JOIN jobs j ON wm.job_id = j.id AND j."deleted_at" IS NULL
        LEFT JOIN master m1 ON wm.material_type_id = m1.id AND m1."deletedAt" IS NULL
        LEFT JOIN master m2 ON wm.material_name_id = m2.id AND m2."deletedAt" IS NULL
        WHERE wm."deleted_at" IS NULL 
        ORDER BY wm."created_at" DESC
        LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      return sendResponse(res, req, 200, i18n.__('success'), rows);
    } catch (error) {
      next(error);
    }
  };

  // _countUsingStatus = async (req:Request,res:Response,next:NextFunction) =>{

  //   try {
  //     const
  //   } catch (error) {
  //     next(error)
  //   }
  // }
}
