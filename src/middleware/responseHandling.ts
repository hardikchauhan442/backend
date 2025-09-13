import { Request, Response } from 'express';
import { logger } from '@app/logger';
import { encrypt } from '@app/helpers';

const sendMessage = (res: Response, req: Request, status: number, message: string): Response | void => {
  try {
    logger.info(`${status} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    return res.status(status).json({ status, message });
  } catch (error) {
    logger.info(`Error in response message: ${error}`);
  }
};

const sendResponse = (res: Response, req: Request, status: number, message: string, data: any): Response | void => {
  try {
    const userAgent = req.headers['user-agent'] || '';
    const isiPhone = /iPhone/.test(userAgent);
    const isiPad = /iPad/.test(userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/.test(userAgent);
    const isMobile = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/.test(userAgent);

    const loggerSet = isiPhone ? 'iPhone' : isiPad ? 'iPad' : isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop';
    logger.info(`${status} - ${req.originalUrl} - ${req.method} - ${req.ip} - ${loggerSet}`);

    // Assuming encrypt is defined and returns encrypted data
    const encryptedData = encrypt(data);
    // const encryptedData = data; // Temporary fallback if `encrypt` is commented out

    const result = { status, message, data: encryptedData };

    return res.status(status).json(process.env.NODE_ENV === 'local' ? { ...result, decrypted_data: data } : result);
  } catch (error) {
    logger.info(`Error in response data: ${error}`);
  }
};

export { sendMessage, sendResponse };
