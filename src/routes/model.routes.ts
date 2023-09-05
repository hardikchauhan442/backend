import { verifyJWT_MW } from '../config/middlewares';

import { Model } from './../controllers/modelController';

export function initRoutes(app, router) {
  const apiRoute = router;
  const models = new Model();

  apiRoute.post('/', models.create);
  apiRoute.get('/', models.findModel);

  apiRoute.route('*').all(verifyJWT_MW);

  return apiRoute;
}
