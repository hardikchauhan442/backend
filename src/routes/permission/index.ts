import { ENDPOINT } from '@app/constant/endPoint.constant';
import { PermissionController } from '@app/controllers/permission/permission.controller';

import { validateBody } from '@app/middleware';
import { createPermissionSchema, updatePermissionSchema } from '@app/types/interfaces/Permission';

import type { Express, Router } from 'express';

export function initRoutes(app: Express, router: Router) {
  const permissionController = new PermissionController();
  router.post(ENDPOINT.BLANK, validateBody(createPermissionSchema), permissionController._create);
  router.get(ENDPOINT.BLANK, permissionController._list);
  router.put(ENDPOINT.WITH_ID, validateBody(updatePermissionSchema), permissionController._update);
  router.delete(ENDPOINT.WITH_ID, permissionController._delete);
  return router;
}
