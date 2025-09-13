import type { Express, Router } from 'express';
import express from 'express';
import * as authRoutes from './auth';
import * as masterRoutes from './master';
import * as userRoutes from './user';
import * as permissionRoutes from './permission';
import * as rawMaterialRoutes from './rawMaterial';
import * as vendorRoutes from './vendor';
import * as manufacturersRoutes from './manufacturers';
import * as cityRoutes from './city';
import * as stateRoutes from './state';
import * as transactionRoutes from './transaction';
import * as countryRoutes from './country';
import * as jobRoutes from './jobs';
import * as productionTrackerRoutes from './ProductionTracker';
import { ENDPOINT } from '@app/constant/endPoint.constant';
import { verifyJWT_MW } from '@app/service';

export function initRoutes(app: Express, router: Router) {
  router.use(ENDPOINT.AUTH, authRoutes.initRoutes(app, express.Router()));
  router.use(ENDPOINT.USER, verifyJWT_MW, userRoutes.initRoutes(app, express.Router()));
  router.use(ENDPOINT.PERMISSION, verifyJWT_MW, permissionRoutes.initRoutes(app, express.Router()));
  router.use(ENDPOINT.ROW_MATERIAL, verifyJWT_MW, rawMaterialRoutes.initRoutes(app, express.Router()));
  router.use(ENDPOINT.VENDOR, verifyJWT_MW, vendorRoutes.initRoutes(app, express.Router()));
  router.use(ENDPOINT.MANUFACTURER, verifyJWT_MW, manufacturersRoutes.initRoutes(app, express.Router()));
  router.use(ENDPOINT.MASTER, masterRoutes.initRoutes(app, express.Router()));
  router.use(ENDPOINT.CITY, cityRoutes.initRoutes(app, express.Router()));
  router.use(ENDPOINT.STATE, stateRoutes.initRoutes(app, express.Router()));
  router.use(ENDPOINT.COUNTRY, countryRoutes.initRoutes(app, express.Router()));
  router.use(ENDPOINT.BLANK, verifyJWT_MW, transactionRoutes.initRoutes(app, express.Router()));
  router.use(ENDPOINT.JOBS, verifyJWT_MW, jobRoutes.initRoutes(app, express.Router()));
  router.use(ENDPOINT.PRODUCTION_TRACKER, verifyJWT_MW, productionTrackerRoutes.initRoutes(app, express.Router()));
  return router;
}
