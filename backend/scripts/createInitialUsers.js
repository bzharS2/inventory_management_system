require('dotenv').config();
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function ensureInitialUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT NOT NULL AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin','staff') NOT NULL DEFAULT 'staff',
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    const [rows] = await connection.query('SELECT username FROM users WHERE username IN (?, ?)', ['admin', 'staff']);
    const existing = new Set(rows.map((row) => row.username));

    if (!existing.has('admin')) {
      const hash = await bcrypt.hash('1234', 12);
      await connection.query(
        'INSERT INTO users (username, password_hash, role, is_active) VALUES (?, ?, "admin", 1)',
        ['admin', hash]
      );
      console.log('Created admin user.');
    }

    if (!existing.has('staff')) {
      const hash = await bcrypt.hash('1234', 12);
      await connection.query(
        'INSERT INTO users (username, password_hash, role, is_active) VALUES (?, ?, "staff", 1)',
        ['staff', hash]
      );
      console.log('Created staff user.');
    }
  } finally {
    await connection.end();
  }
}

ensureInitialUsers()
  .then(() => {
    console.log('Initial users check complete.');
  })
  .catch((error) => {
    console.error('Failed to ensure initial users:', error);
    process.exit(1);
  });
