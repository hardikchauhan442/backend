import { initDb, pool } from '@app/config/db';
import { createUserTable } from './user.model';
import { createMasterTable } from './master.model';
import { createPermissionTable } from './permistion.model';
import { createRawMaterialTable } from './raw_materials.model';
import { logger } from '@app/logger';
import { createVendorsTable } from './vendors.model';
import { createManufacturersTable } from './manufacturers.model';
import { createLocationTable } from './location.model';
import { createRawMaterialTransactionsTable } from './raw_material_transactions';
import { createJobsTable } from './jobs.model';
import { createProductionTrackerTable } from './production_tracker.model';
import { createWastageReturnMaterialTable } from './wastage';

(async () => {
  await initDb();
  await createMasterTable();
  await createPermissionTable();
  await createLocationTable();
  await createUserTable();
  await createVendorsTable();
  await createManufacturersTable();
  await createRawMaterialTable();
  await createJobsTable();
  await createRawMaterialTransactionsTable();
  await createProductionTrackerTable();
  await createWastageReturnMaterialTable();

  logger.info('✅ All models were synchronized successfully.');
})();
