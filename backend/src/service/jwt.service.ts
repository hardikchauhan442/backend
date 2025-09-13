import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { environment } from '@app/config';
import { logger } from '@app/logger';
import { pool } from '@app/config/db';

interface DecodedToken {
  data: { email: string; id: string };
}

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const verifyJWTToken = (token: string): Promise<DecodedToken> => {
  const { secret } = environment;
  if (!secret) {
    throw new Error('JWT secret is not defined in environment');
  }

  return new Promise((resolve, reject) => {
    jwt.verify(token, secret as jwt.Secret, (err, decodedToken) => {
      if (err || !decodedToken) {
        console.log(err, ' err');

        return reject(err);
      }
      resolve(decodedToken as DecodedToken);
    });
  });
};

export const createJWToken = (payload: string | object | Buffer | number | boolean | null) => {
  const { secret } = environment;
  if (!secret) {
    throw new Error('JWT secret is not defined in environment');
  }
  return jwt.sign(
    {
      data: payload,
    },
    secret as jwt.Secret,
    {
      expiresIn: 360000,
      algorithm: 'HS256',
    }
  );
};

export async function verifyJWT_MW(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const tokenHeader = req.headers['authorization'];

  if (!tokenHeader) {
    req.user = undefined;
    res.status(401).json({ success: false, message: 'Unauthorized user!' });
    return;
  }

  const token = Array.isArray(tokenHeader) ? tokenHeader[0] : (tokenHeader as string);

  try {
    const decode = await verifyJWTToken(token.replace('Bearer ', ''));
    // pool.connect();
    const result = await pool.query(`SELECT * FROM "User" WHERE email = $1 AND id = $2 AND "deletedAt" IS NULL`, [decode.data.email, decode.data.id]);

    if ((result.rowCount ?? 0) === 0) {
      req.user = undefined;
      logger.error(`User not found  JWT Error`);
      res.status(400).json({ message: 'Invalid auth token provided.' });
    } else {
      req.user = result.rows[0];
    }

    next();
  } catch (err) {
    logger.error(`${err}  JWT Error`);
    res.status(400).json({ message: 'Invalid auth token provided.' });
  }
}
