import express, { Express } from 'express';

import * as apiRoutes from './app.routes';
import * as testRoutes from './test.routes';
import { ENDPOINT } from '@app/constant/endPoint.constant';

export function initRoutes(app: Express) {
  app.use(ENDPOINT.BASE + ENDPOINT.TEST, testRoutes.initRoutes(app, express.Router()));
  app.use(ENDPOINT.BASE, apiRoutes.initRoutes(app, express.Router()));
  return app;
}
