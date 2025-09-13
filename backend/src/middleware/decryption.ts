import { Request, Response, NextFunction } from 'express';
import { decrypt } from '../helpers';

/**
 * decryptData
 * @description If data comes in req.body, decrypt it and attach to req.body.data
 */
const decryptData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.body?.data) {
      let data = req.body.data;
      const decryptedData = decrypt(data);

      req.body.data = decryptedData;
    }
    next();
  } catch (error) {
    next(error);
  }
};

export { decryptData };
