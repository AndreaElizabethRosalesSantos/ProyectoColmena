// model/cuponModel.js
const pool = require('../db/conexion');

// Validar cupón por código
async function validarCupon(codigo) {
    const [rows] = await pool.query(`
        SELECT * FROM cupones 
        WHERE codigo = ? 
        AND activo = 1 
        AND (fecha_expiracion IS NULL OR fecha_expiracion > NOW())
    `, [codigo]);
    
    return rows[0];
}

// Obtener cupón por código (sin validar expiración)
async function obtenerCuponPorCodigo(codigo) {
    const [rows] = await pool.query(
        'SELECT * FROM cupones WHERE codigo = ?',
        [codigo]
    );
    return rows[0];
}

// Crear un nuevo cupón
async function crearCupon(codigo, descuento, activo = 1, fechaExpiracion = null) {
    const [result] = await pool.query(
        'INSERT INTO cupones (codigo, descuento, activo, fecha_expiracion) VALUES (?, ?, ?, ?)',
        [codigo, descuento, activo, fechaExpiracion]
    );
    return result.insertId;
}

// Actualizar estado de cupón
async function actualizarEstadoCupon(codigo, activo) {
    const [result] = await pool.query(
        'UPDATE cupones SET activo = ? WHERE codigo = ?',
        [activo, codigo]
    );
    return result.affectedRows;
}

module.exports = {
    validarCupon,
    obtenerCuponPorCodigo,
    crearCupon,
    actualizarEstadoCupon
};