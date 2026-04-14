require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Sanket007',
  database: process.env.DB_NAME || 'label_generator',
});

connection.connect();

module.exports = connection;
