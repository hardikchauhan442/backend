import { verifyJWT_MW } from '../config/middlewares';

import { addCol } from './../controllers/coustm_fild';

export function initRoutes(app, router) {
  const apiRoute = router;
  const addColums = new addCol();

  apiRoute.post('/:id', addColums.create);
  apiRoute.get('/:id', addColums.findModelFiled);

  apiRoute.route('*').all(verifyJWT_MW);

  return apiRoute;
}
