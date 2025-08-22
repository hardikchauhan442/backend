import express, { Express } from 'express';
import cors from 'cors';
import { json, urlencoded } from 'body-parser';
import fileUpload from 'express-fileupload';
import * as routes from './routes/';
import { logger } from './logger/Logger';
import { environment } from './config';
import { errorHandlerMiddleware, responseHandling } from './middleware';

if (!environment.port) {
  process.exit(1);
}

const PORT = environment.port || 3000;

export class Server {
  private app: Express;

  constructor() {
    this.app = express();
    this.app.use(
      cors({
        optionsSuccessStatus: 200,
      }),
    );
    this.app.use(
      fileUpload({
        limits: {
          fileSize: 1000000 * 5000, //5gb
          files: 10000,
        },
        abortOnLimit: true,
        responseOnLimit: 'Limit Exceed',
      }),
    );
    this.app.use(
      urlencoded({
        extended: true,
        limit: '500mb',
      }),
    );
    this.app.use(express.json({ limit: '500mb' }));
    this.app.use(json());
    this.app.use('/', express.static('./src/public'));
    this.app.use(express.static('public'));
    this.app.use(responseHandling);
    routes.initRoutes(this.app);
    this.app.use(errorHandlerMiddleware);
    this.app.listen(PORT, () => {
      logger.info(`👍 Server successfully started at port ${PORT}`);
    });
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
