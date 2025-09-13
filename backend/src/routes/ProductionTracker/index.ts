import { ENDPOINT } from '@app/constant/endPoint.constant';
import { ProductionTrackerController } from '@app/controllers/production_tracker/production_tracker.controller';

import { validateBody } from '@app/middleware';
import { productionTrackerCreateSchema } from '@app/types/interfaces/productionTracke';

import type { Express, Router } from 'express';

export function initRoutes(app: Express, router: Router) {
  const productionTrackerController = new ProductionTrackerController();
  router.post(ENDPOINT.BLANK, validateBody(productionTrackerCreateSchema), productionTrackerController._create);

  router.put(ENDPOINT.STATUS + ENDPOINT.WITH_ID, productionTrackerController._update_status);
  router.get(ENDPOINT.BLANK, productionTrackerController._list);
  router.get(ENDPOINT.COUNT, productionTrackerController._count);

  // router.delete(ENDPOINT.WITH_ID, jobsController._delete);
  return router;
}
