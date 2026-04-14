const util = require('util');
const bcrypt = require('bcryptjs');
const db = require('./db');

const query = util.promisify(db.query.bind(db));

async function bootstrapAuth() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(191) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  const rows = await query('SELECT id FROM users LIMIT 1');
  if (rows.length > 0) {
    return;
  }

  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'admin123';
  const userPassword = process.env.USER_INITIAL_PASSWORD || 'user123';
  const adminHash = await bcrypt.hash(adminPassword, 10);
  const userHash = await bcrypt.hash(userPassword, 10);

  await query(
    'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?), (?, ?, ?)',
    ['admin', adminHash, 'admin', 'user', userHash, 'user'],
  );

  console.log(
    '[auth] Seeded default users: admin and user (set ADMIN_INITIAL_PASSWORD / USER_INITIAL_PASSWORD in .env to choose passwords)',
  );
}

module.exports = { bootstrapAuth };
