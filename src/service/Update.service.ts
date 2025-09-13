// db/updateQuery.ts
// export function buildUpdateQueryById<T extends Record<string, any>>(table: string, id: string, data: T) {
//   // Filter out undefined (optional for PATCH behaviour)
//   const entries = Object.entries(data).filter(([_, v]) => v !== undefined);

//   if (entries.length === 0) {
//     throw new Error('No fields provided to update');
//   }

//   const keys = entries.map(([k]) => k);
//   const values = entries.map(([_, v]) => v);

//   const set = keys.map((k, i) => `"${k}"=$${i + 2}`).join(', ');

//   const text = `UPDATE ${table}
//                 SET ${set}, "updatedAt"=NOW()
//                 WHERE id=$1
//                 RETURNING *`;

//   return { text, values: [id, ...values] };
// }

// db/updateQuery.ts
export function build_update_query_by_id<T extends Record<string, any>>(table: string, id: string, data: T) {
  // Filter out undefined (optional for PATCH behaviour)
  const entries = Object.entries(data).filter(([_, v]) => v !== undefined);

  if (entries.length === 0) {
    throw new Error('No fields provided to update');
  }

  const keys = entries.map(([k]) => k);
  const values = entries.map(([_, v]) => v);

  const set = keys.map((k, i) => `"${k}"=$${i + 2}`).join(', ');

  const text = `UPDATE ${table} 
                SET ${set}, "updated_at"=NOW() 
                WHERE id=$1 
                RETURNING *`;

  return { text, values: [id, ...values] };
}

export function buildUpdateQueryById<T extends Record<string, any>>(
  table: string,
  id: string,
  data: T,
  updatedColumn: 'updated_at' | 'updatedAt' | 'deletedAt' | 'deleted_at' = 'updated_at'
) {
  const entries = Object.entries(data).filter(([_, v]) => v !== undefined);

  if (entries.length === 0) {
    throw new Error('No fields provided to update');
  }

  const keys = entries.map(([k]) => k);
  const values = entries.map(([_, v]) => v);

  const set = keys.map((k, i) => `"${k}"=$${i + 2}`).join(', ');

  const text = `UPDATE ${table}
                SET ${set}, "${updatedColumn}"=NOW()
                WHERE id=$1
                RETURNING *`;

  return { text, values: [id, ...values] };
}
