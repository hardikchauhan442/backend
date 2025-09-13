import { ENDPOINT } from '@app/constant/endPoint.constant';
import { UserController } from '@app/controllers/users/user.controller';
import { validateBody } from '@app/middleware';
import { createMasterSchema, updateMasterSchema } from '@app/types/interfaces/Master';
import { createUserSchema, updateUserSchema } from '@app/types/interfaces/User';

import type { Express, Router } from 'express';

export function initRoutes(app: Express, router: Router) {
  const userController = new UserController();
  router.post(ENDPOINT.BLANK, validateBody(createUserSchema), userController._create);
  router.get(ENDPOINT.BLANK, userController._list);
  router.get(ENDPOINT.WITH_ID, userController._getUserById);
  router.put(ENDPOINT.WITH_ID, validateBody(updateUserSchema), userController._update);
  router.delete(ENDPOINT.WITH_ID, userController._delete);
  return router;
}
