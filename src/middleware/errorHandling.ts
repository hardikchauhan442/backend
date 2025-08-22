import { ErrorType } from '../utils/errorTypes';
import { logger } from '../logger/Logger';

function generateErrorResponse(err, status, req, res) {
  try {
    const userAgent = req.headers['user-agent'];
    const isiPhone = /iPhone/.test(userAgent);
    const isiPad = /iPad/.test(userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/.test(userAgent);
    const isMobile = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/.test(userAgent);

    const loggerSet = isiPhone ? 'iPhone' : isiPad ? 'iPad' : isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop';

    logger.error(`${status} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}-${loggerSet}`);
  } catch (error) {
    logger.error(`Failed to track request: ${error.message}`);
  }
  const errObj = { status: status, message: err.message };
  return res.status(status).send(errObj);
}

function generateAndSendAppErrorResponse(err, res, req) {
  switch (err.reason) {
    case ErrorType.invalid_request:
      logger.error(`400 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
      return generateErrorResponse(err, 400, req, res);

    case ErrorType.not_found:
      logger.error(`404 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
      return generateErrorResponse(err, 404, req, res);

    case ErrorType.Forbidden:
      logger.error(`403 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
      return generateErrorResponse(err, 403, req, res);

    case ErrorType.unauthorized:
      logger.error(`401 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
      return generateErrorResponse(err, 401, req, res);

    case ErrorType.conflict:
      logger.error(`409 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
      return generateErrorResponse(err, 409, req, res);

    case ErrorType.validation_error:
      logger.error(`400 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
      return generateErrorResponse(err, 400, req, res);

    case ErrorType.unknown_error:
      break;
    default:
      logger.error(`500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
      return generateErrorResponse(err, 500, req, res);
  }
}
export default function (err, req, res, next) {
  // Do something more with the error here...
  return generateAndSendAppErrorResponse(err, res, req);
}
