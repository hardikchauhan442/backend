import { ENDPOINT } from '@app/constant/endPoint.constant';
import { CityController } from '@app/controllers/city/city.controller';
import type { Express, Router } from 'express';

export function initRoutes(app: Express, router: Router) {
  const cityController = new CityController();

  router.get(ENDPOINT.BLANK, cityController._list);
  router.get(ENDPOINT.STATE + ENDPOINT.WITH_ID, cityController._listByStateId);
  router.get(ENDPOINT.COUNTRY + ENDPOINT.WITH_ID, cityController._listByCountryId);

  return router;
}
