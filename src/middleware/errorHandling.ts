import { ErrorType } from '@app/constant';
import { Request, Response, NextFunction } from 'express';

import i18n from '../locales';
import { logger } from '@app/logger';

interface AppError extends Error {
  reason?: ErrorType;
  errors?: { message: string }[];
}

async function generateErrorResponse(err: AppError, status: number, req: Request, res: Response): Promise<Response> {
  try {
    const userAgent = req.headers['user-agent'] ?? '';
    const isiPhone = /iPhone/.test(userAgent);
    const isiPad = /iPad/.test(userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/.test(userAgent);
    const isMobile = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/.test(userAgent);

    const loggerSet = isiPhone ? 'iPhone' : isiPad ? 'iPad' : isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop';
    logger.error(`${status} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}-${loggerSet}`);
  } catch (error: any) {
    logger.error(`Failed to track request: ${error.message}`);
  }

  const errObj = { status: status, message: err.message };
  return res.status(status).send(errObj);
}

function generateAndSendAppErrorResponse(err: AppError, res: Response, req: Request): Promise<Response> {
  switch (err.reason) {
    case ErrorType.invalid_request:
      return generateErrorResponse(err, 400, req, res);

    case ErrorType.not_found:
      return generateErrorResponse(err, 404, req, res);

    case ErrorType.Forbidden:
      return generateErrorResponse(err, 403, req, res);

    case ErrorType.unauthorized:
      return generateErrorResponse(err, 401, req, res);

    case ErrorType.conflict:
      return generateErrorResponse(err, 409, req, res);

    case ErrorType.validation_error:
      return generateErrorResponse(err, 400, req, res);

    case ErrorType.TEMP_STATUS:
      return generateErrorResponse(err, 205, req, res);

    case ErrorType.unknown_error:
    default:
      logger.error(`${500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
      err.message = i18n.__('common.internalServerError');
      return generateErrorResponse(err, 500, req, res);
  }
}

export default function (err: AppError, req: Request, res: Response, next: NextFunction): Promise<Response> {
  // Do something more with the error here...
  return generateAndSendAppErrorResponse(err, res, req);
}
