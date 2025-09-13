// src/controllers/user.controller.ts
import { Response, NextFunction } from 'express';
import { PoolClient } from 'pg';

import i18n from '@app/locales';
import { pool } from '@app/config/db';

import { sendMessage, sendResponse } from '@app/middleware';
import { CreateUserDto, UpdateUserDto } from '@app/types/interfaces/User';
import { AuthenticatedRequest } from '@app/service/jwt.service';

export class UserController {
  async _create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    let client: PoolClient | undefined;
    try {
      client = await pool.connect();
      await client.query('BEGIN');

      const body: CreateUserDto = req.body.data;
      const reqUser = req?.user;
      if (reqUser) body.createdBy = reqUser.id;

      const { rows: existing } = await client.query(`SELECT 1 FROM "User" WHERE email = $1 LIMIT 1`, [body.email]);
      if (existing.length) {
        await client.query('ROLLBACK');
        return sendMessage(res, req, 400, i18n.__('userAlreadyExists'));
      }

      await client.query(`INSERT INTO "User"(name,email, password, "createdBy", "roleId", "isActive") VALUES($1,$2,$3,$4,$5,$6)`, [
        body.name,
        body.email,
        body.password,
        body.createdBy,
        body.roleId,
        body.isActive,
      ]);

      await client.query('COMMIT');
      return sendResponse(res, req, 200, i18n.__('created'), {});
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      next(error);
    } finally {
      client?.release();
    }
  }

  async _list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      // join master for role data
      const { rows } = await pool.query(
        `
        SELECT u.name, u.email, u."isActive",u.id , p."role_name" as "roleName"
        FROM "User" u
        LEFT JOIN "permission" p ON u."roleId" = p.id
          ORDER BY u."createdAt" DESC
           LIMIT $1 OFFSET $2
      `,
        [limit, offset]
      );
      return sendResponse(res, req, 200, i18n.__('getSuccess'), rows);
    } catch (error) {
      next(error);
    }
  }

  async _getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { rows } = await pool.query(
        `
        SELECT u.*, p."role_name" as "roleName"
        FROM "User" u
        LEFT JOIN "permission" p ON u."roleId" = p.id
        WHERE u.id = $1
      `,
        [id]
      );
      if (!rows.length) return sendMessage(res, req, 400, i18n.__('notFound'));
      return sendResponse(res, req, 200, i18n.__('getSuccess'), rows[0]);
    } catch (error) {
      next(error);
    }
  }

  async _update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    let client: PoolClient | undefined;
    try {
      client = await pool.connect();
      await client.query('BEGIN');

      const { id } = req.params;
      const body: UpdateUserDto = req.body.data;
      const reqUser = req?.user;
      if (reqUser) body.updatedBy = reqUser.id;

      const { rows: existing } = await client.query(`SELECT 1 FROM "User" WHERE id = $1 LIMIT 1`, [id]);
      if (!existing.length) {
        await client.query('ROLLBACK');
        return sendMessage(res, req, 400, i18n.__('notFound'));
      }

      // Build dynamic update
      await client.query(
        `UPDATE "User"
         SET email=$1, "updatedBy"=$2, "roleId"=$3 , "updatedAt"=NOW(), name=$4 , "isActive"=$5
         WHERE id=$6`,
        [body.email, body.updatedBy, body.roleId, body.name, body.isActive, id]
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

  async _delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    let client: PoolClient | undefined;
    try {
      client = await pool.connect();
      await client.query('BEGIN');

      const { id } = req.params;

      const { rows: existing } = await client.query(`SELECT 1 FROM "User" WHERE id=$1`, [id]);
      if (!existing.length) {
        await client.query('ROLLBACK');
        return sendMessage(res, req, 400, i18n.__('notFound'));
      }

      const reqUser = req?.user;

      await client.query(`UPDATE "User" SET "deletedBy"=$1, "deletedAt"=NOW() WHERE id=$2`, [reqUser?.id ?? null, id]);

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
