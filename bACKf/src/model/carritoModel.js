// model/carritoModel.js
const pool = require('../db/conexion');

// Agregar producto al carrito
async function agregarItemCarrito(usuarioId, productoId, cantidad) {
    const [result] = await pool.query(
        'INSERT INTO carrito (usuario_id, producto_id, cantidad) VALUES (?, ?, ?)',
        [usuarioId, productoId, cantidad]
    );
    return result.insertId;
}

// Obtener carrito completo de un usuario con info de productos
async function obtenerCarritoUsuario(usuarioId) {
    const [rows] = await pool.query(`
        SELECT 
            c.id,
            c.usuario_id,
            c.producto_id,
            c.cantidad,
            p.nombre,
            p.precio,
            p.imagen,
            p.disponibilidad 
        FROM carrito c 
        JOIN productos p ON c.producto_id = p.id 
        WHERE c.usuario_id = ?
    `, [usuarioId]);
    return rows;
}

// Actualizar cantidad de un producto en el carrito
async function actualizarCantidadCarrito(itemId, cantidad) {
    const [result] = await pool.query(
        'UPDATE carrito SET cantidad = ? WHERE id = ?',
        [cantidad, itemId]
    );
    return result.affectedRows;
}

// Eliminar un producto específico del carrito
async function eliminarItemCarrito(itemId) {
    const [result] = await pool.query(
        'DELETE FROM carrito WHERE id = ?',
        [itemId]
    );
    return result.affectedRows;
}

// Vaciar todo el carrito de un usuario
async function vaciarCarritoUsuario(usuarioId) {
    const [result] = await pool.query(
        'DELETE FROM carrito WHERE usuario_id = ?',
        [usuarioId]
    );
    return result.affectedRows;
}

// Obtener órdenes de un usuario
async function obtenerOrdenesUsuario(usuarioId) {
    const [rows] = await pool.query(
        'SELECT * FROM ordenes WHERE usuario_id = ? ORDER BY id DESC',
        [usuarioId]
    );
    return rows;
}

// Crear una nueva orden
async function crearOrden(usuarioId, total, impuestos) {
    const [result] = await pool.query(
        'INSERT INTO ordenes (usuario_id, total, impuestos) VALUES (?, ?, ?)',
        [usuarioId, total, impuestos]
    );
    return result.insertId;
}

// Crear detalles de orden
async function crearDetalleOrden(ordenId, productoId, cantidad, precio) {
    const [result] = await pool.query(
        'INSERT INTO orden_detalles (orden_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [ordenId, productoId, cantidad, precio]
    );
    return result.insertId;
}

// Actualizar inventario después de una compra
async function actualizarInventario(productoId, cantidad) {
    const [result] = await pool.query(
        'UPDATE productos SET disponibilidad = disponibilidad - ?, ventas = ventas + ? WHERE id = ? AND disponibilidad >= ?',
        [cantidad, cantidad, productoId, cantidad]
    );
    return result.affectedRows;
}

// Obtener items del carrito para crear orden
async function obtenerItemsParaOrden(usuarioId) {
    const [rows] = await pool.query(`
        SELECT c.*, p.nombre, p.precio, p.disponibilidad 
        FROM carrito c 
        JOIN productos p ON c.producto_id = p.id 
        WHERE c.usuario_id = ?
    `, [usuarioId]);
    return rows;
}

// Verificar si producto ya está en carrito
async function productoEnCarrito(usuarioId, productoId) {
    const [rows] = await pool.query(
        'SELECT * FROM carrito WHERE usuario_id = ? AND producto_id = ?',
        [usuarioId, productoId]
    );
    return rows[0];
}

module.exports = {
    agregarItemCarrito,
    obtenerCarritoUsuario,
    actualizarCantidadCarrito,
    eliminarItemCarrito,
    vaciarCarritoUsuario,
    obtenerOrdenesUsuario,
    crearOrden,
    crearDetalleOrden,
    actualizarInventario,
    obtenerItemsParaOrden,
    productoEnCarrito
};