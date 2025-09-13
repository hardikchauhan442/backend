import { pool } from '@app/config/db';
import i18n from '@app/locales';
import { sendResponse } from '@app/middleware';
import { NextFunction, Request, Response } from 'express';

export class CountryController {
  async _list(req: Request, res: Response, next: NextFunction) {
    try {
      const sql = `SELECT * FROM countries`;
      const result = await pool.query(sql);
      return sendResponse(res, req, 200, i18n.__('getSuccess'), result.rows);
    } catch (error) {
      next(error);
    }
  }
}
