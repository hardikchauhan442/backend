import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { generateString } from '@app/helpers';
import i18n from '@app/locales/index';

import appError from '@app/utils/errorHelper';
import { ErrorType } from '@app/constant';
import { sendResponse } from '@app/middleware';
import { createJWToken } from '@app/service';
import { LoginDto } from '@app/types/interfaces/User';
import { pool } from '@app/config/db';

export class SessionController {
  async _login(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { email, password }: LoginDto = req.body.data;
      const lowerCaseMail = email.toLowerCase();

      const userSql = `
        SELECT u.* , row_to_json(p.*) AS "roleData"
        FROM "User" u
        LEFT JOIN permission p ON u."roleId" = p.id and p."deletedAt" IS NULL
        WHERE LOWER(u.email) = $1 AND u."deletedAt" IS NULL
        LIMIT 1
      `;
      const { rows } = await pool.query(userSql, [lowerCaseMail]);
      const userDetails = rows[0];

      if (!userDetails) {
        throw new appError(i18n.__('invalidLoginDetails'), ErrorType.unauthorized);
      }

      if (userDetails.isActive === false) {
        throw new appError(i18n.__('deactivatedError'), ErrorType.Forbidden);
      }

      const validPassword = await bcrypt.compare(password, userDetails.password);

      if (!validPassword) {
        throw new appError(i18n.__('invalidLoginDetails'), ErrorType.unauthorized);
      }

      const key: string = generateString(32);
      const token = createJWToken({ id: userDetails.id, email: userDetails.email, key });

      delete userDetails.password;

      const masterSql = `
        SELECT m.*, json_agg(sm.*) as "subMasters"
        FROM master m
        LEFT JOIN master sm ON sm."parentId" = m.id AND sm."deletedAt" IS NULL
        WHERE m."parentId" IS NULL AND m."deletedAt" IS NULL
        GROUP BY m.id
      `;
      const { rows: master } = await pool.query(masterSql);

      const response = {
        ...userDetails,
        token,
        key,
        master,
      };

      return sendResponse(res, req, 200, i18n.__('loginSuccess'), response);
    } catch (error) {
      console.log(error);

      return next(error);
    }
  }
}
