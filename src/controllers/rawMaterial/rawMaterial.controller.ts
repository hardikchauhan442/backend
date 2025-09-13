import { pool } from '@app/config/db';
import i18n from '@app/locales';
import { sendMessage, sendResponse } from '@app/middleware';
import { buildInsertQuery } from '@app/service/Add.service';
import { AuthenticatedRequest } from '@app/service/jwt.service';
import { build_update_query_by_id, buildUpdateQueryById } from '@app/service/Update.service';
import { CreateRawMaterialDto, UpdateRawMaterialDto } from '@app/types/interfaces/RowMaterials';

import { NextFunction, Response } from 'express';
import { PoolClient } from 'pg';

export class RawMaterialController {
  async _create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    let client: PoolClient | undefined;
    try {
      client = await pool.connect();
      await client.query('BEGIN');
      const body: CreateRawMaterialDto = req.body.data;
      const reqUser = req?.user;
      if (reqUser) body.created_by = reqUser.id;

      const { text, values } = buildInsertQuery(
        'raw_materials',
        {
          material_name_id: body.material_name_id,
          material_type_id: body.material_type_id,
          unit_id: body.unit_id,
          quantity: body.quantity,
          weight: body.weight,
          status: body.status,
          description: body.description,
          vendor_id: body.vendor_id,
          is_active: body.is_active,
          created_by: body.created_by,
        },
        'id'
      );
      let rawMaterialId = await client.query(text, values);

      await client.query('COMMIT');
      const { text: insertText, values: insertValues } = buildInsertQuery('raw_material_transactions', {
        raw_material_id: rawMaterialId.rows[0].id,
        material_type_id: body.material_type_id,
        material_name_id: body.material_name_id,
        unit_id: body.unit_id,
        transaction_type: 'IN',
        quantity: body.quantity,
        weight: body.weight,
        description: body.description,
        vendor_id: body.vendor_id,
        created_by: body.created_by,
      });
      await client.query(insertText, insertValues);
      await client.query('COMMIT');
      return sendResponse(res, req, 200, i18n.__('created'), {});
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      next(error);
    } finally {
      client?.release();
    }
  }

  async _update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    let client: PoolClient | undefined;
    try {
      client = await pool.connect();
      await client.query('BEGIN');
      const body: UpdateRawMaterialDto = req.body.data;
      const reqUser = req?.user;
      if (reqUser) body.updated_by = reqUser.id;
      const { id } = req.params;

      const existing = await client.query('SELECT id FROM raw_materials WHERE id = $1 AND "deleted_at" IS NULL', [id]);
      if (existing.rowCount === 0) {
        await client.query('ROLLBACK');
        return sendMessage(res, req, 400, i18n.__('notFound'));
      }

      const data = {
        material_name_id: body.material_name_id,
        material_type_id: body.material_type_id,
        unit_id: body.unit_id,
        quantity: body.quantity,
        weight: body.weight,
        status: body.status,
        description: body.description,
        vendor_id: body.vendor_id,
        is_active: body.is_active,
        updated_by: body.updated_by,
      };
      const { text, values } = build_update_query_by_id('raw_materials', id, data);

      await client.query(text, values);

      await client.query(
        `UPDATE raw_material_transactions SET material_type_id = $2, material_name_id = $3, unit_id = $4, quantity = $5, weight = $6, description = $7, vendor_id = $8, updated_by = $9 WHERE raw_material_id = $1`,
        [id, body.material_type_id, body.material_name_id, body.unit_id, body.quantity, body.weight, body.description, body.vendor_id, reqUser.id]
      );

      await client.query('COMMIT');
      return sendResponse(res, req, 200, i18n.__('updateSuccess'), {});
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      next(error);
    } finally {
      client?.release();
    }
  }
  async _list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    let client: PoolClient | undefined;
    try {
      client = await pool.connect();
      await client.query('BEGIN');

      const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
      const pageSize = Number(req.query.limit) > 0 ? Number(req.query.limit) : 100;
      const offset = (page - 1) * pageSize;

      const { rows } = await client.query(`
        SELECT 
          rm.*,
          m.name AS "unit_name",
          m1.name AS "material_type",
          mn.name AS "material_name",
          v."vendorName" AS "vendor_name"
        FROM raw_materials rm
        LEFT JOIN master m  ON rm."unit_id"          = m.id
        LEFT JOIN master m1 ON rm."material_type_id" = m1.id
        LEFT JOIN master mn ON rm."material_name_id" = mn.id
        LEFT JOIN vendors v ON rm."vendor_id" = v.id
        WHERE rm."deleted_at" IS NULL 
        ORDER BY rm."created_at" DESC
      `);
      await client.query('COMMIT');
      return sendResponse(res, req, 200, i18n.__('getSuccess'), rows);
    } catch (error) {
      return next(error);
    } finally {
      client?.release();
    }
  }

  async _delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    let client: PoolClient | undefined;
    try {
      client = await pool.connect();
      await client.query('BEGIN');
      const { id } = req.params;
      const existing = await client.query('SELECT id FROM raw_materials WHERE id = $1 AND "deleted_at" IS NULL', [id]);
      if (existing.rowCount === 0) {
        await client.query('ROLLBACK');
        return sendMessage(res, req, 400, i18n.__('notFound'));
      }
      const { text, values } = buildUpdateQueryById('raw_materials', id, { deleted_at: new Date(), deleted_by: req.user.id }, 'deleted_at');
      await client.query(text, values);
      await client.query('COMMIT');
      return sendResponse(res, req, 200, i18n.__('deleteSuccess'), {});
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      next(error);
    } finally {
      client?.release();
    }
  }
}
