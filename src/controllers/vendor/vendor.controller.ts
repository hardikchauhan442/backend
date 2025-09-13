import { pool } from '@app/config/db';
import i18n from '@app/locales';
import { sendMessage, sendResponse } from '@app/middleware';
import { AuthenticatedRequest } from '@app/service/jwt.service';
import { buildUpdateQueryById } from '@app/service/Update.service';
import { VendorCreate, VendorUpdate } from '@app/types/interfaces/vendors';
import { NextFunction, Response } from 'express';
import { PoolClient } from 'pg';

export class VendorController {
  async _create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    let client: PoolClient | undefined;
    try {
      client = await pool.connect();
      await client.query('BEGIN');
      const body: VendorCreate = req.body.data;
      const reqUser = req?.user;
      if (reqUser) body.createdBy = reqUser.id;

      if (body.email) {
        const { rows: existing } = await client.query(`SELECT 1 FROM vendors WHERE email = $1 AND "deletedAt" IS NULL`, [body.email]);
        if (existing.length > 0) {
          await client.query('ROLLBACK');
          return sendResponse(res, req, 400, 'Email already exists', {});
        }
      }
      await client.query(
        `INSERT INTO "vendors"("vendorName","vendorCode","contactPerson","contactNumber","email","website","addressLine1","addressLine2","cityId","stateId","countryId","zipCode","notes","isActive","createdBy") VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [
          body.vendorName,
          body.vendorCode,
          body.contactPerson,
          body.contactNumber,
          body.email,
          body.website,
          body.addressLine1,
          body.addressLine2,
          body.cityId,
          body.stateId,
          body.countryId,
          body.zipCode,
          body.notes,
          body.isActive ?? true,
          body.createdBy,
        ]
      );

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
        SELECT v.*, c.name as countryName, s.name as stateName, ci.name as cityName FROM "vendors" v
        JOIN "countries" c ON v."countryId" = c."id"
        JOIN "states" s ON v."stateId" = s."id"
        JOIN "cities" ci ON v."cityId" = ci."id"
        WHERE v."deletedAt" IS NULL
        ORDER BY v."createdAt" DESC
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
        SELECT v.*, c.name as countryName, s.name as stateName, ci.name as cityName
        FROM "vendors" v
        JOIN "countries" c ON v."countryId" = c."id"
        JOIN "states" s ON v."stateId" = s."id"
        JOIN "cities" ci ON v."cityId" = ci."id"
        WHERE v.id = $1 AND v."deletedAt" IS NULL
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
      const body: VendorUpdate = req.body.data;
      const reqUser = req?.user;
      if (reqUser) body.updatedBy = reqUser.id;

      const { rows: existing } = await client.query(`SELECT 1 FROM "vendors" WHERE id = $1 AND "deletedAt" IS NULL LIMIT 1`, [id]);
      if (!existing.length) {
        await client.query('ROLLBACK');
        return sendMessage(res, req, 400, i18n.__('notFound'));
      }

      const { text, values } = buildUpdateQueryById(
        'vendors',
        id,
        {
          vendorName: body.vendorName,
          vendorCode: body.vendorCode,
          contactPerson: body.contactPerson,
          contactNumber: body.contactNumber,
          email: body.email,
          website: body.website,
          addressLine1: body.addressLine1,
          addressLine2: body.addressLine2,
          cityId: body.cityId,
          stateId: body.stateId,
          countryId: body.countryId,
          zipCode: body.zipCode,
          notes: body.notes,
          isActive: body.isActive,
          updatedBy: body.updatedBy,
        },
        'updatedAt'
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
  }

  async _delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    let client: PoolClient | undefined;
    try {
      client = await pool.connect();
      await client.query('BEGIN');

      const { id } = req.params;

      const existing = await client.query('SELECT id FROM vendors WHERE id = $1 AND "deletedAt" IS NULL', [id]);
      if (existing.rowCount === 0) {
        await client.query('ROLLBACK');
        return sendMessage(res, req, 400, i18n.__('notFound'));
      }

      // soft delete:
      await client.query(`UPDATE vendors SET "deletedAt" = NOW(), "deletedBy" = $2 WHERE id = $1`, [id, req.user.id ?? null]);

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
