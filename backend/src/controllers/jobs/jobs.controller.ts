import { pool } from '@app/config/db';
import i18n from '@app/locales';
import { sendMessage, sendResponse } from '@app/middleware';
import { buildInsertQuery } from '@app/service/Add.service';
import { AuthenticatedRequest } from '@app/service/jwt.service';
import { buildUpdateQueryById } from '@app/service/Update.service';
import { JobsCreateSchema, JobsUpdateSchema } from '@app/types/interfaces/jobs';
import { NextFunction, Response, Request } from 'express';
import { PoolClient } from 'pg';

export class JobController {
  _create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let client: PoolClient | undefined;
    try {
      client = await pool.connect();
      await client.query('BEGIN');
      const body: JobsCreateSchema = req.body.data;
      const job_code = 'JOB' + Date.now();
      if (body.materials.length === 0) {
        return sendMessage(res, req, 400, i18n.__('materialRequired'));
      }
      const reqUser = req?.user;
      if (reqUser) body.created_by = reqUser.id;

      const { text, values } = buildInsertQuery(
        'jobs',
        {
          product_name: body.product_name,
          customer_name: body.customer_name,
          job_code: job_code,
          priority: body.priority,
          due_date: body.due_date,
          cost_estimate: body.cost_estimate,
          manufacturer_id: body.manufacturer_id,
          job_description: body.job_description,
          special_instructions: body.special_instructions,
          file_path: body.file_path,
          status: body.status,
          created_by: body.created_by,
        },
        'id'
      );
      let job_id = await client.query(text, values);
      job_id = job_id.rows[0].id;
      for (const m of body.materials) {
        const { text: jmText, values: jmValues } = buildInsertQuery(
          'job_materials',
          {
            job_id,
            material_type_id: m.material_type_id,
            material_name_id: m.material_name_id,
            quantity: m.quantity,
            weight: m.weight,
            unit_id: m.unit_id,
            material_cost: m.material_cost,
            created_by: body.created_by,
          },
          'id'
        );

        const jmInsert = await client.query(jmText, jmValues);
        const jobMaterialId = jmInsert.rows[0].id;

        // Insert raw_material_transactions linked to this job material
        const { text: rmtText, values: rmtValues } = buildInsertQuery(
          'raw_material_transactions',
          {
            job_id: job_id,
            raw_material_id: null, // if you have a raw_materials table, use its id here
            job_materials_id: jobMaterialId,
            material_type_id: m.material_type_id,
            material_name_id: m.material_name_id,
            unit_id: m.unit_id,
            transaction_type: 'OUT',
            quantity: m.quantity,
            weight: m.weight,
            description: body.job_description,
            manufacturer_id: body.manufacturer_id,
            created_by: body.created_by,
          },
          'id'
        );
        await client.query(rmtText, rmtValues);
      }

      await client.query('COMMIT');
      return sendResponse(res, req, 200, i18n.__('created'), {});
    } catch (error) {
      console.log(error);

      if (client) await client.query('ROLLBACK');
      next(error);
    } finally {
      client?.release();
    }
  };

  _list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // optional pagination
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const manufacturer = req.query.manufacturer;
      const priority = req.query.priority;
      const status = req.query.status;
      const offset = (page - 1) * limit;

      // main jobs query
      const jobsQuery = `
      SELECT 
        j.*,
        m."manufacturerName" as "manufacturer_name",
        json_agg(
          json_build_object(
            'id', jm.id,
            'material_type_id', jm.material_type_id,
            'material_name_id', jm.material_name_id,
            'quantity', jm.quantity,
            'weight', jm.weight,
            'unit_id', jm.unit_id,
            'material_cost', jm.material_cost,
            'material_type', mt.name,
            'material_name', mn.name,
            'unit', mu.name
          )
        ) AS materials
      FROM jobs j
      LEFT JOIN manufacturers m ON j.manufacturer_id = m.id AND m."deletedAt" IS NULL
      LEFT JOIN job_materials jm ON j.id = jm.job_id AND jm.deleted_at IS NULL
      LEFT JOIN master mt ON jm.material_type_id = mt.id AND mt."deletedAt" IS NULL
      LEFT JOIN master mn ON jm.material_name_id = mn.id AND mn."deletedAt" IS NULL
      LEFT JOIN master mu ON jm.unit_id = mu.id AND mu."deletedAt" IS NULL
      WHERE j.deleted_at IS NULL
      ${manufacturer ? `AND j.manufacturer_id = '${manufacturer}'` : ''}
      ${priority ? `AND j.priority = '${priority}'` : ''}
      ${status ? `AND j.status = '${status}'` : ''}
    GROUP BY j.id, m."manufacturerName"
      ORDER BY j.created_at DESC
      LIMIT $1 OFFSET $2;
    `;

      const { rows } = await pool.query(jobsQuery, [limit, offset]);

      // total count for pagination
      const countRes = await pool.query(`SELECT COUNT(*) FROM jobs WHERE deleted_at IS NULL;`);

      return sendResponse(res, req, 200, i18n.__('getSuccess'), {
        rows,
        count: countRes.rows[0].count,
        page,
        limit,
      });
    } catch (err) {
      next(err);
    }
  };

  _delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const client = await pool.connect();
    try {
      const { id } = req.params;
      await client.query('BEGIN');
      const existing = await client.query('SELECT id FROM jobs WHERE id = $1 AND "deleted_at" IS NULL', [id]);
      if (existing.rowCount === 0) {
        await client.query('ROLLBACK');
        return sendMessage(res, req, 400, i18n.__('notFound'));
      }
      await client.query(`UPDATE jobs SET deleted_at = NOW(), deleted_by = $1 WHERE id = $2`, [req.user.id, id]);
      await client.query(`UPDATE job_materials SET deleted_at = NOW(), deleted_by = $1 WHERE job_id = $2`, [req.user.id, id]);
      await client.query('COMMIT');
      return sendResponse(res, req, 200, i18n.__('deleteSuccess'), {});
    } catch (error) {
      await client.query('ROLLBACK');
      next(error);
    } finally {
      client.release();
    }
  };

  _update = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let client: PoolClient | undefined;
    try {
      client = await pool.connect();
      await client.query('BEGIN');

      const body: JobsUpdateSchema = req.body.data; // validate body
      const jobId = req.params.id;
      const reqUser = req?.user;
      if (reqUser) body.updated_by = reqUser.id;

      // 1. update jobs
      const { text, values } = buildUpdateQueryById(
        'jobs',
        jobId,
        {
          product_name: body.product_name,
          customer_name: body.customer_name,
          priority: body.priority,
          due_date: body.due_date,
          cost_estimate: body.cost_estimate,
          manufacturer_id: body.manufacturer_id,
          job_description: body.job_description,
          special_instructions: body.special_instructions,
          file_path: body.file_path,
          status: body.status,
          updated_by: body.updated_by,
        },
        'updated_at'
      );
      await client.query(text, values);

      const existingRes = await client.query(`SELECT id FROM job_materials WHERE job_id=$1`, [jobId]);
      const existingIds = existingRes.rows.map((r) => r.id);

      const payloadIds = new Set(body.materials?.filter((m) => m.id).map((m) => m.id));

      const toDelete = existingIds.filter((id) => !payloadIds.has(id));
      if (toDelete.length > 0) {
        await client.query(`DELETE FROM job_materials WHERE job_id=$1 AND id = ANY($2::uuid[])`, [jobId, toDelete]);
      }

      for (const m of body.materials) {
        if (m.id && existingIds.includes(m.id)) {
          // UPDATE existing
          const { text, values } = buildUpdateQueryById(
            'job_materials',
            m.id,
            {
              material_type_id: m.material_type_id,
              material_name_id: m.material_name_id,
              quantity: m.quantity,
              weight: m.weight,
              unit_id: m.unit_id,
              material_cost: m.material_cost,
              updated_by: body.updated_by,
            },
            'updated_at' // if your column is updated_at
          );
          await client.query(text, values);
        } else {
          // INSERT new
          const { text: insertText, values: insertValues } = buildInsertQuery('job_materials', {
            job_id: jobId,
            material_type_id: m.material_type_id,
            material_name_id: m.material_name_id,
            quantity: m.quantity,
            weight: m.weight,
            unit_id: m.unit_id,
            material_cost: m.material_cost,
            created_by: body.updated_by,
          });
          await client.query(insertText, insertValues);
        }
      }

      await client.query('COMMIT');
      return sendResponse(res, req, 200, i18n.__('updated'), {});
    } catch (error) {
      console.log(error);
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
      const { status, description } = req.body.data;

      const existing = await client.query('SELECT id FROM jobs WHERE id = $1 AND "deleted_at" IS NULL', [id]);
      if (existing.rowCount === 0) {
        await client.query('ROLLBACK');
        return sendMessage(res, req, 400, i18n.__('notFound'));
      }
      await client.query(`UPDATE jobs SET status = $1, updated_at = NOW(), updated_by = $2 WHERE id = $3`, [status, req.user.id, id]);
      if (status === 'In Progress') {
        const { text, values } = buildInsertQuery(
          'production_tracker',
          {
            job_id: id,
            status,
            created_by: req.user.id,
          },
          'id'
        );
        await client.query(text, values);
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
}
