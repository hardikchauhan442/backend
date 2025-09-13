import { Request, Response, NextFunction } from 'express';
import { pool } from '@app/config/db';
import i18n from '@app/locales';
import { sendMessage, sendResponse } from '@app/middleware';
import { CreatePermissionDto, UpdatePermissionDto } from '@app/types/interfaces/Permission';
import { AuthenticatedRequest } from '@app/service/jwt.service';
import { buildUpdateQueryById } from '@app/service/Update.service';

export class PermissionController {
  async _create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    const client = await pool.connect();
    try {
      const body: CreatePermissionDto = req.body.data;

      await client.query('BEGIN');

      // check existing permission for same role
      const existing = await client.query('SELECT id FROM permission WHERE "role_name" = $1 AND "deletedAt" IS NULL', [body.role_name]);
      if (existing.rowCount ?? 0 > 0) {
        await client.query('ROLLBACK');
        return sendMessage(res, req, 400, i18n.__('permissionAlreadyExists'));
      }

      await client.query(
        `INSERT INTO permission ("id", "role_name", "permission", "description", "isActive", "createdBy", "createdAt", "updatedAt") 
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())`,
        [body.role_name, body.permission, body.description ?? null, body.isActive ?? true, req?.user?.id ?? null]
      );

      await client.query('COMMIT');
      return sendResponse(res, req, 200, i18n.__('created'), {});
    } catch (error) {
      await client.query('ROLLBACK');
      return next(error);
    } finally {
      client.release();
    }
  }

  async _list(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const sql = `SELECT * FROM "permission" WHERE "deletedAt" IS NULL`;
      const result = await pool.query(sql);
      return sendResponse(res, req, 200, i18n.__('getSuccess'), result.rows);
    } catch (error) {
      return next(error);
    }
  }

  async _update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    const client = await pool.connect();
    try {
      const { id } = req.params;
      const body: UpdatePermissionDto = req.body.data;

      await client.query('BEGIN');

      const existing = await client.query('SELECT id FROM permission WHERE id = $1 AND "deletedAt" IS NULL', [id]);
      if (existing.rowCount === 0) {
        await client.query('ROLLBACK');
        return sendMessage(res, req, 400, i18n.__('notFound'));
      }

      const { text, values } = buildUpdateQueryById(
        'permission',
        id,
        {
          role_name: body.role_name,
          permission: body.permission,
          description: body.description,
          isActive: body.isActive,
          updatedBy: req?.user?.id,
        },
        'updatedAt'
      );

      await client.query(text, values);

      await client.query('COMMIT');
      return sendResponse(res, req, 200, i18n.__('updateSuccess'), {});
    } catch (error) {
      await client.query('ROLLBACK');
      return next(error);
    } finally {
      client.release();
    }
  }

  async _delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    const client = await pool.connect();
    try {
      const { id } = req.params;

      await client.query('BEGIN');

      const existing = await client.query('SELECT id FROM permission WHERE id = $1 AND "deletedAt" IS NULL', [id]);
      if (existing.rowCount === 0) {
        await client.query('ROLLBACK');
        return sendMessage(res, req, 400, i18n.__('notFound'));
      }

      const { text, values } = buildUpdateQueryById(
        'permission',
        id,
        {
          deletedAt: new Date(),
          deletedBy: req?.user?.id,
        },
        'deletedAt'
      );

      await client.query(text, values);

      await client.query('COMMIT');
      return sendResponse(res, req, 200, i18n.__('deleteSuccess'), {});
    } catch (error) {
      await client.query('ROLLBACK');
      return next(error);
    } finally {
      client.release();
    }
  }
}
