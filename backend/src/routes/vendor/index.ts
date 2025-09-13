import { ENDPOINT } from '@app/constant/endPoint.constant';
import { RawMaterialController } from '@app/controllers/rawMaterial/rawMaterial.controller';
import { VendorController } from '@app/controllers/vendor/vendor.controller';
import { validateBody } from '@app/middleware';
import { VendorCreateSchema, VendorUpdateSchema } from '@app/types/interfaces/vendors';

import type { Express, Router } from 'express';

export function initRoutes(app: Express, router: Router) {
  const vendorsController = new VendorController();
  router.post(ENDPOINT.BLANK, validateBody(VendorCreateSchema), vendorsController._create);
  router.get(ENDPOINT.BLANK, vendorsController._list);
  router.get(ENDPOINT.WITH_ID, vendorsController._getUserById);
  router.put(ENDPOINT.WITH_ID, validateBody(VendorUpdateSchema), vendorsController._update);
  router.delete(ENDPOINT.WITH_ID, vendorsController._delete);
  return router;
}
