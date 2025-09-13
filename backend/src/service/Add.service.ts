export function buildInsertQuery<T extends Record<string, any>>(table: string, data: T, returning?: boolean | string | string[]) {
  const entries = Object.entries(data).filter(([_, v]) => v !== undefined);

  if (entries.length === 0) {
    throw new Error('No fields provided to insert');
  }

  const keys = entries.map(([k]) => `"${k}"`).join(', ');
  const placeholders = entries.map((_, i) => `$${i + 1}`).join(', ');
  const values = entries.map(([_, v]) => v);

  let returningClause = '';
  if (returning) {
    if (returning === true) {
      returningClause = ' RETURNING *';
    } else if (Array.isArray(returning)) {
      // join with comma, quote each col
      const cols = returning.map((c) => `"${c}"`).join(', ');
      returningClause = ` RETURNING ${cols}`;
    } else if (typeof returning === 'string') {
      // assume user gave raw string of columns
      returningClause = ` RETURNING ${returning}`;
    }
  }

  const text = `INSERT INTO ${table} (${keys})
                VALUES (${placeholders})${returningClause}`;

  return { text, values };
}
