const pool = require('../db/conexion.js');
const { encrypt, decrypt } = require("../helpers/password");

// Obtener cuenta para login
async function getUserByCount(usuario) {
    const [rows] = await pool.query(
        "SELECT * FROM users WHERE usuario = ? LIMIT 1",
        [usuario]
    );
    return rows[0] || null;
}

// Crear usuario
async function createUser(nomCompleto, usuario, email, contrasena1, telefono, direccion) {

    const contrasenaHasheada = await encrypt(contrasena1);

    const [result] = await pool.query(
        `INSERT INTO users 
        (nomCompleto, Usuario, Email, Contrasena, Telefono, Direccion, Cuenta, fallos, bloqueo_hasta)
        VALUES (?, ?, ?, ?, ?, ?, 0, 0, NULL)`,
        [nomCompleto, usuario, email, contrasenaHasheada, telefono, direccion]
    );

    return result.insertId;
}


// Actualizar contraseña
async function updateUser(id, nuevaContrasena) {
    const contrasenaEncriptada = encrypt(nuevaContrasena);

    const [result] = await pool.query(
        "UPDATE users SET contrasena = ? WHERE id = ?",
        [contrasenaEncriptada, id]
    );

    return result.affectedRows;
}

// Obtener usuario por nombre (para strikes)
async function getUserByName(usuario) {
    const [rows] = await pool.query(
        "SELECT * FROM users WHERE usuario = ? LIMIT 1",
        [usuario]
    );
    return rows[0] || null;
}

// Sumar un strike
async function strikeUserByName(usuario) {
    const [result] = await pool.query(
        "UPDATE users SET fallos = fallos + 1 WHERE usuario = ?",
        [usuario]
    );
    return result.affectedRows;
}

// Bloquear usuario
async function intentosFallidos(usuario, bloqueo_hasta) {
    await pool.query(
        "UPDATE users SET bloqueo_hasta = ?, fallos = 0 WHERE usuario = ?",
        [bloqueo_hasta, usuario]
    );
}

module.exports = {
    getUserByCount,
    getUserByName,
    createUser,
    updateUser,
    strikeUserByName,
    intentosFallidos
};
