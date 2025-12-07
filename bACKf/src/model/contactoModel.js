const pool = require('../db/conexion');

//inserta datos en db
async function crearContacto(nombre, email, mensaje) {
  await pool.query(
    "INSERT INTO contacto (nombre, email, mensaje) VALUES (?, ?, ?)",
    [nombre, email, mensaje]
  );
}

module.exports = { crearContacto };