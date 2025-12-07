const pool = require('../db/conexion');

//Guarda correos en la base datos para suscripcion
async function guardarCorreo(email) {
    const [result] = await pool.query(
        'INSERT INTO suscriptores (email) VALUES (?)',
        [email]
    );
    return result.insertId;
}

module.exports = { guardarCorreo };