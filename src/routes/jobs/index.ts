import { ENDPOINT } from '@app/constant/endPoint.constant';
import { JobController } from '@app/controllers/jobs/jobs.controller';
import { ReturnMaterialController } from '@app/controllers/jobs/retuen_materiyal.controller';
import { WastageController } from '@app/controllers/jobs/wastage.controller';

import { validateBody } from '@app/middleware';
import { createJobSchema, materialRecordSchema, materialRecordUpdateSchema, updateJobSchema } from '@app/types/interfaces/jobs';

import type { Express, Router } from 'express';

export function initRoutes(app: Express, router: Router) {
  const jobsController = new JobController();
  const wastageController = new WastageController();
  const returnMaterialController = new ReturnMaterialController();
  // wastage
  router.put(ENDPOINT.WASTAGE + ENDPOINT.WITH_ID, validateBody(materialRecordUpdateSchema), wastageController._updateStatus);
  router.post(ENDPOINT.WASTAGE, validateBody(materialRecordSchema), wastageController._create);
  router.get(ENDPOINT.WASTAGE, wastageController._list);

  // return-material
  router.put(ENDPOINT.RETURN_MATERIAL + ENDPOINT.WITH_ID, validateBody(materialRecordUpdateSchema), returnMaterialController._updateStatus);
  router.post(ENDPOINT.RETURN_MATERIAL, validateBody(materialRecordSchema), returnMaterialController._create);
  router.get(ENDPOINT.RETURN_MATERIAL, returnMaterialController._list);

  // jobs
  router.post(ENDPOINT.BLANK, validateBody(createJobSchema), jobsController._create);
  router.get(ENDPOINT.BLANK, jobsController._list);
  router.put(ENDPOINT.STATUS + ENDPOINT.WITH_ID, jobsController._updateStatus);
  router.put(ENDPOINT.WITH_ID, validateBody(updateJobSchema), jobsController._update);
  router.delete(ENDPOINT.WITH_ID, jobsController._delete);
  return router;
}
