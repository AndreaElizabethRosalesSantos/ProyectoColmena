// db/conexion.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool(process.env.DATABASE_URL);

// Añadir event listeners para debug
pool.on('connection', (connection) => {
  console.log('Nueva conexión establecida con la BD');
});

pool.on('error', (err) => {
  console.error('Error en el pool de conexiones:', err);
});

module.exports = pool;