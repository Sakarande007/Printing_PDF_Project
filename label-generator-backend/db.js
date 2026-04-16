require('dotenv').config();
const mysql = require('mysql2');

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Sanket007',
  database: process.env.DB_NAME || 'label_generator',
};

let connection;

function connectWithRetry() {
  connection = mysql.createConnection(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.error('❌ MySQL connection failed. Retrying in 3 sec...', err.code);
      setTimeout(connectWithRetry, 3000);
    } else {
      console.log('✅ Connected to MySQL');
    }
  });

  connection.on('error', (err) => {
    console.error('⚠️ MySQL error:', err.code);

    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      connectWithRetry();
    } else {
      throw err;
    }
  });
}

connectWithRetry();

// We export the function as requested, but also attach .query to it 
// so that db.query works in other files (preventing the undefined error).
const getDb = () => connection;
getDb.query = function(...args) {
  if (!connection) throw new Error("MySQL Connection not ready");
  return connection.query(...args);
};

module.exports = getDb;
