import { ENDPOINT } from '@app/constant/endPoint.constant';
import { StateController } from '@app/controllers/state/state.controller';

import type { Express, Router } from 'express';

export function initRoutes(app: Express, router: Router) {
  const stateController = new StateController();

  router.get(ENDPOINT.BLANK, stateController._list);
  router.get(ENDPOINT.WITH_ID, stateController._listByCountryId);

  return router;
}
