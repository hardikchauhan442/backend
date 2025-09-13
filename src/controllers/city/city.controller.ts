import { pool } from '@app/config/db';
import i18n from '@app/locales';
import { sendResponse } from '@app/middleware';
import { NextFunction, Request, Response } from 'express';

export class CityController {
  async _list(req: Request, res: Response, next: NextFunction) {
    try {
      const sql = `SELECT * FROM cities`;
      const result = await pool.query(sql);
      return sendResponse(res, req, 200, i18n.__('getSuccess'), result.rows);
    } catch (error) {
      next(error);
    }
  }

  async _listByStateId(req: Request, res: Response, next: NextFunction) {
    try {
      const sql = `SELECT * FROM cities WHERE "state_id" = $1`;
      const result = await pool.query(sql, [req.params.id]);
      return sendResponse(res, req, 200, i18n.__('getSuccess'), result.rows);
    } catch (error) {
      next(error);
    }
  }

  async _listByCountryId(req: Request, res: Response, next: NextFunction) {
    try {
      const sql = `SELECT * FROM cities WHERE "country_id" = $1`;
      const result = await pool.query(sql, [req.params.id]);
      return sendResponse(res, req, 200, i18n.__('getSuccess'), result.rows);
    } catch (error) {
      next(error);
    }
  }
}
