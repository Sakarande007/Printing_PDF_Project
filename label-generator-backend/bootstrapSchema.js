const util = require('util');
const db = require('./db');

const query = util.promisify(db.query.bind(db));

async function ensureColumn(table, column, definition) {
  const rows = await query(
    `SELECT COUNT(*) AS c FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = ?
     AND COLUMN_NAME = ?`,
    [table, column],
  );
  if (Number(rows[0].c) === 0) {
    await query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`[schema] Added column ${table}.${column}`);
  }
}

async function ensureSchema() {
  // parts – existing columns
  await ensureColumn('parts', 'country_of_origin', 'VARCHAR(191) NULL DEFAULT NULL');

  // parts – individual label descriptions
  await ensureColumn('parts', 'description_eng', 'VARCHAR(500) NULL DEFAULT NULL');
  await ensureColumn('parts', 'description_fr',  'VARCHAR(500) NULL DEFAULT NULL');
  await ensureColumn('parts', 'description_esp', 'VARCHAR(500) NULL DEFAULT NULL');

  // vendors – extended profile
  await ensureColumn('vendors', 'vendor_code',   'VARCHAR(100) NULL DEFAULT NULL');
  await ensureColumn('vendors', 'address_line1', 'VARCHAR(255) NULL DEFAULT NULL');
  await ensureColumn('vendors', 'address_line2', 'VARCHAR(255) NULL DEFAULT NULL');
  await ensureColumn('vendors', 'country',       'VARCHAR(100) NULL DEFAULT NULL');
}

module.exports = { ensureSchema };
