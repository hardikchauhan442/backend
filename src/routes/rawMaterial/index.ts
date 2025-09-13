import { ENDPOINT } from '@app/constant/endPoint.constant';
import { RawMaterialController } from '@app/controllers/rawMaterial/rawMaterial.controller';

import { validateBody } from '@app/middleware';
import { RawMaterialCreateSchema, RawMaterialUpdateSchema } from '@app/types/interfaces/RowMaterials';

import type { Express, Router } from 'express';

export function initRoutes(app: Express, router: Router) {
  const rawMaterialsController = new RawMaterialController();
  router.post(ENDPOINT.BLANK, validateBody(RawMaterialCreateSchema), rawMaterialsController._create);
  router.get(ENDPOINT.BLANK, rawMaterialsController._list);
  // router.get(ENDPOINT.WITH_ID, rawMaterialsController._getUserById);
  router.put(ENDPOINT.WITH_ID, validateBody(RawMaterialUpdateSchema), rawMaterialsController._update);
  // router.delete(ENDPOINT.WITH_ID, rawMaterialsController._delete);
  return router;
}
