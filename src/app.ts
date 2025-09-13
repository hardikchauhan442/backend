// import 'module-alias/register';
import express, { Express } from 'express';
import cors from 'cors';
import { json, urlencoded } from 'body-parser';
import fileUpload from 'express-fileupload';
import v8 from 'v8';
import '@app/models';
import * as routes from '@app/routes';
import { logger } from '@app/logger';
import { environment } from '@app/config';
import { decryptData, errorHandlerMiddleware } from '@app/middleware';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

if (!environment.appPort) {
  process.exit(1);
}

const PORT = environment.appPort;

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

export class Server {
  private app: Express;

  constructor() {
    this.app = express();
    this.app.use(helmet());
    // this.app.use(limiter);
    this.app.use(
      cors({
        optionsSuccessStatus: 200,
      })
    );
    this.app.use(
      fileUpload({
        limits: {
          fileSize: 1000000 * 5000, //5gb
          files: 10000,
        },
        abortOnLimit: true,
        responseOnLimit: 'Limit Exceed',
      })
    );
    this.app.use(
      urlencoded({
        extended: true,
        limit: '500mb',
      })
    );
    this.app.use(express.json({ limit: '500mb' }));
    this.app.use(json());

    this.app.use('/', express.static('./src/public'));
    this.app.use(express.static('public'));
    this.app.use(decryptData);
    routes.initRoutes(this.app);
    this.app.use(errorHandlerMiddleware);
    this.app.listen(Number(PORT), '0.0.0.0', () => {
      logger.info(`👍 Server successfully started at port ${PORT}`);
    });
    logger.info(`🧠 MAX HEAP SIZE LIMIT: ${v8.getHeapStatistics().heap_size_limit / 1024 / 1024} MB`);
  }

  getApp() {
    return this.app;
  }
}
new Server();

process.on('uncaughtException', async (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', async (promise, reason) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);

  process.exit(1);
});
