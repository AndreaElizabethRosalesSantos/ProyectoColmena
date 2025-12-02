const pool = require('../db/conexion');

//obtener todos los productos
async function getAllProductos() {
    const [rows] = await pool.query('SELECT * FROM productos');
    return rows; 
}

//obtener un producto por ID
async function getProductoId(id) {
    const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
    return rows[0];  //solo uno
}

//insertar nuevo producto
async function postProducto(categoria, nombre, imagen, descripcion, precio, disponibilidad, ventas) {
    const [result] = await pool.query(
        'INSERT INTO productos (categoria, nombre, imagen, descripcion, precio, disponibilidad, ventas) VALUES ( ?, ?, ?, ?, ?, ?, ?)',
        [categoria, nombre, imagen, descripcion, precio, disponibilidad, ventas]
    );
    return result.insertId;
}

//eliminar libro
async function deleteProducto(id) {
    const [result] = await pool.query('DELETE FROM productos WHERE id = ?', [id]);
    return result.affectedRows;
}

//actualizar libro existente
async function putProducto(id, categoria, nombre, imagen, descripcion, precio, disponibilidad, ventas) {
    const [result] = await pool.query(
        'UPDATE productos SET categoria = ?, nombre = ?, imagen = ?, descripcion = ?, precio = ?, disponibilidad = ?, ventas = ? WHERE id = ?',
        [categoria, nombre, imagen, descripcion, precio, disponibilidad, ventas, id]
    );
    return result.affectedRows;
}

module.exports = {
    getAllProductos,
    getProductoId,
    postProducto,
    deleteProducto,
    putProducto
};