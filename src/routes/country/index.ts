import { ENDPOINT } from '@app/constant/endPoint.constant';
import { CountryController } from '@app/controllers/country/country.controller';

import type { Express, Router } from 'express';

export function initRoutes(app: Express, router: Router) {
  const countryController = new CountryController();

  router.get(ENDPOINT.BLANK, countryController._list);

  return router;
}
