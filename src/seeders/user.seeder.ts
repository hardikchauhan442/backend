import { environment } from '@app/config';
import { pool } from '@app/config/db';
import bcrypt from 'bcrypt';

export const runUserSeeder = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query('SELECT id FROM "User" WHERE "email" = $1 AND "deletedAt" IS NULL', [environment.adminEmail]);
    if (existing.rowCount ?? 0 > 0) {
      await client.query('ROLLBACK');
      return;
    }
    const hashPassword = bcrypt.hashSync(environment.adminPassword ?? '', 10);

    let permissionId = await client.query(
      `INSERT INTO "permission"("role_name","permission","description","isActive") VALUES($1,$2,$3,$4) RETURNING id`,
      [
        'Super Admin',
        [
          { name: 'inventory', actions: { edit: true, view: true, create: true, delete: true } },
          { name: 'dashboard', actions: { view: true } },
          { name: 'production', actions: { edit: true, view: true, create: true, delete: true } },
        ],
        null,
        true,
      ]
    );
    permissionId = permissionId.rows[0].id;
    await client.query(`INSERT INTO "User"("name","email","phone","password","isActive","roleId","createdBy") VALUES($1,$2,$3,$4,$5,$6,$7)`, [
      environment.adminName,
      environment.adminEmail,
      null,
      hashPassword,
      true,
      permissionId,
      null,
    ]);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
