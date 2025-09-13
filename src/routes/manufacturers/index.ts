import { ENDPOINT } from '@app/constant/endPoint.constant';
import { ManufacturerController } from '@app/controllers/manufacturers/manufacturers.controller';
import { validateBody } from '@app/middleware';
import { ManufacturerCreateSchema, ManufacturerUpdateSchema } from '@app/types/interfaces/manufacturers';

import type { Express, Router } from 'express';

export function initRoutes(app: Express, router: Router) {
  const manufacturerController = new ManufacturerController();
  router.post(ENDPOINT.BLANK, validateBody(ManufacturerCreateSchema), manufacturerController._create);
  router.get(ENDPOINT.BLANK, manufacturerController._list);
  router.get(ENDPOINT.WITH_ID, manufacturerController._getUserById);
  router.put(ENDPOINT.WITH_ID, validateBody(ManufacturerUpdateSchema), manufacturerController._update);
  router.delete(ENDPOINT.WITH_ID, manufacturerController._delete);
  return router;
}
