import { createAccountSchema } from '../validation/user.validation';
import { verifyJWT_MW } from '../config/middlewares';
import { END_POINT } from '../constant/endpoint';
import { UsersController } from '../controllers/users';

export function initRoutes(app, router) {
  const apiRoute = router;
  const users = new UsersController('Users');

  apiRoute.post(END_POINT.LOGIN, users._login);
  apiRoute.post(END_POINT.SIGNUP, createAccountSchema, users._create);
  apiRoute.get(END_POINT.GET_USER, verifyJWT_MW, users._list);

  return apiRoute;
}
