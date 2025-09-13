import { ENDPOINT } from '@app/constant/endPoint.constant';
import { SessionController } from '@app/controllers/auth/session.controller';
import { validateBody } from '@app/middleware';
import { loginSchema } from '@app/types/interfaces/User';
import type { Express, Router } from 'express';

export function initRoutes(app: Express, router: Router) {
  const authController = new SessionController();
  router.post(ENDPOINT.LOGIN, validateBody(loginSchema), authController._login);
  return router;
}
