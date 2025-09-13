import { Request, Response, NextFunction } from 'express';
import i18n from '@app/locales';
import { sendMessage, sendResponse } from '@app/middleware';
import { MasterInput } from '@app/types/interfaces/Master';
import { pool } from '@app/config/db'; // <-- your pg Pool
import { AuthenticatedRequest } from '@app/service/jwt.service';
import { buildUpdateQueryById } from '@app/service/Update.service';
import { buildInsertQuery } from '@app/service/Add.service';

export class MasterController {
  // CREATE
  async _create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const body: MasterInput = req.body.data;

      const existing = await pool.query(`SELECT id FROM master WHERE code = $1 AND "deletedAt" IS NULL`, [body.code]);
      if (existing.rowCount ?? 0 > 0) {
        return sendMessage(res, req, 400, i18n.__('alreadyExists'));
      }

      if (body.parentId) {
        const parentMaster = await pool.query(
          `SELECT sequence FROM master WHERE "parentId"=$1  AND "deletedAt" IS NULL ORDER BY sequence DESC LIMIT 1`,
          [body.parentId]
        );

        const findParent = await pool.query(`SELECT code,name,sequence  FROM master WHERE id=$1 AND "deletedAt" IS NULL`, [body.parentId]);
        if (findParent.rowCount === 0) {
          return sendMessage(res, req, 400, i18n.__('invalidParent'));
        }

        const parentData = findParent.rows[0];
        body.sequence = parentMaster.rowCount ?? 0 > 0 ? parentMaster.rows[0].sequence + 1 : 1;
        body.parentCode = parentData.code;
        body.groupName = parentData.name;
      }

      const { text, values } = buildInsertQuery('master', {
        name: body.name,
        code: body.code,
        parentId: body.parentId,
        parentCode: body.parentCode,
        groupName: body.groupName,
        sequence: body.sequence ?? 1,
        isActive: body.isActive,
        isDisplay: body.isDisplay,
        isDefault: body.isDefault,
        createdBy: req.user.id ?? null,
      });

      await pool.query(text, values);
      return sendResponse(res, req, 200, i18n.__('created'), {});
    } catch (error) {
      next(error);
    }
  }

  async _list(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      // Get top-level masters
      const masters = await pool.query(`SELECT * FROM master WHERE "parentId" IS NULL AND "deletedAt" IS NULL`);
      // For each, attach subMasters
      const withSubs = await Promise.all(
        masters.rows.map(async (row) => {
          const subs = await pool.query(`SELECT * FROM master WHERE "parentId"=$1 AND "deletedAt" IS NULL`, [row.id]);
          return { ...row, subMasters: subs.rows };
        })
      );
      return sendResponse(res, req, 200, i18n.__('getSuccess'), withSubs);
    } catch (error) {
      next(error);
    }
  }

  // GET MASTER BY ID
  async _getMasterById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const master = await pool.query(`SELECT * FROM master WHERE id=$1 AND "parentId" IS NULL AND "deletedAt" IS NULL`, [id]);
      if (master.rowCount === 0) {
        return sendMessage(res, req, 400, i18n.__('notFound'));
      }
      const subs = await pool.query(`SELECT * FROM master WHERE "parentId"=$1 AND "deletedAt" IS NULL`, [id]);
      return sendResponse(res, req, 200, i18n.__('getSuccess'), {
        ...master.rows[0],
        subMasters: subs.rows,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET SUBMASTERS BY MASTER
  async _getSubMasterByMaster(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const data = await pool.query(`SELECT * FROM master WHERE "parentId"=$1 AND "deletedAt" IS NULL`, [id]);
      return sendResponse(res, req, 200, i18n.__('getSuccess'), data.rows);
    } catch (error) {
      next(error);
    }
  }

  // UPDATE
  async _update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const body: MasterInput = req.body.data;

      const existing = await pool.query(`SELECT id FROM master WHERE id=$1 AND "deletedAt" IS NULL`, [id]);
      if (existing.rowCount === 0) {
        return sendMessage(res, req, 400, i18n.__('notFound'));
      }

      if (body.code) {
        const codeExist = await pool.query(`SELECT id FROM master WHERE code=$1 AND id<>$2 AND "deletedAt" IS NULL`, [body.code, id]);
        if (codeExist.rowCount ?? 0 > 0) {
          return sendMessage(res, req, 400, i18n.__('alreadyExists'));
        }
      }

      const { text, values } = buildUpdateQueryById(
        'master',
        id,
        {
          name: body.name,
          code: body.code,
          sequence: body.sequence,
          isActive: body.isActive,
          isDisplay: body.isDisplay,
          isDefault: body.isDefault,
          updatedBy: body.updatedBy,
        },
        'updatedAt'
      );
      await pool.query(text, values);

      return sendResponse(res, req, 200, i18n.__('updateSuccess'), {});
    } catch (error) {
      next(error);
    }
  }

  // DELETE
  async _delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { id } = req.params;

      const existing = await client.query(`SELECT id FROM master WHERE id=$1 AND "deletedAt" IS NULL`, [id]);
      if (existing.rowCount === 0) {
        await client.query('ROLLBACK');
        return sendMessage(res, req, 400, i18n.__('notFound'));
      }

      const findSubMaster = await client.query(`SELECT id FROM master WHERE "parentId"=$1 AND "deletedAt" IS NULL`, [id]);
      if (findSubMaster.rowCount ?? 0 > 0) {
        await client.query('ROLLBACK');
        return sendMessage(res, req, 400, i18n.__('hasSubMaster'));
      }

      const { text, values } = buildUpdateQueryById(
        'master',
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
      next(error);
    } finally {
      client.release();
    }
  }

  async _updateSequence(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const client = await pool.connect();
    try {
      const updates: any = req.body.data.items;

      await client.query('BEGIN');

      for (const row of updates) {
        const { text, values } = buildUpdateQueryById(
          'master',
          row.id,
          {
            sequence: row.sequence,
            updatedBy: req?.user?.id,
          },
          'updatedAt'
        );
        await client.query(text, values);
      }

      await client.query('COMMIT');
      return sendResponse(res, req, 200, i18n.__('updateSuccess'), {});
    } catch (error) {
      await client.query('ROLLBACK');

      next(error);
    } finally {
      client.release();
    }
  }
}
