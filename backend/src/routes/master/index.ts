import { ENDPOINT } from '@app/constant/endPoint.constant';
import { MasterController } from '@app/controllers/master/master.controller';
import { validateBody } from '@app/middleware';
import { verifyJWT_MW } from '@app/service';
import { createMasterSchema, updateMasterSchema } from '@app/types/interfaces/Master';

import type { Express, Router } from 'express';

export function initRoutes(app: Express, router: Router) {
  const masterController = new MasterController();
  router.post(ENDPOINT.BLANK, verifyJWT_MW, validateBody(createMasterSchema), masterController._create);
  router.get(ENDPOINT.BLANK, masterController._list);
  router.get(ENDPOINT.WITH_ID, masterController._getMasterById);
  router.get(ENDPOINT.SUB_MASTER + ENDPOINT.WITH_ID, masterController._getSubMasterByMaster);
  router.put(ENDPOINT.SEQUENCE, verifyJWT_MW, masterController._updateSequence);
  router.put(ENDPOINT.WITH_ID, verifyJWT_MW, validateBody(updateMasterSchema), masterController._update);
  router.delete(ENDPOINT.WITH_ID, verifyJWT_MW, masterController._delete);
  return router;
}
