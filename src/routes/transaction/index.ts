import { ENDPOINT } from '@app/constant/endPoint.constant';
import { TransactionController } from '@app/controllers/transactions/transactions.controller';

import { validateBody } from '@app/middleware';

import type { Express, Router } from 'express';

export function initRoutes(app: Express, router: Router) {
  const transactionController = new TransactionController();
  router.get(ENDPOINT.STOCK, transactionController._listStock);
  router.get(ENDPOINT.TRANSACTION, transactionController._listTransactions);
  return router;
}
