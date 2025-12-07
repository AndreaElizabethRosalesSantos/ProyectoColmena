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
async function postProducto(categoria, nombre, imagen, descripcion, precio, disponibilidad, ventas, ofertas) {
    const [result] = await pool.query(
        'INSERT INTO productos (categoria, nombre, imagen, descripcion, precio, disponibilidad, ventas, ofertas ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?)',
        [categoria, nombre, imagen, descripcion, precio, disponibilidad, ventas, ofertas]
    );
    return result.insertId;
}

//eliminar libro
async function deleteProducto(id) {
    const [result] = await pool.query('DELETE FROM productos WHERE id = ?', [id]);
    return result.affectedRows;
}

//actualizar producto existente
async function putProducto(id, categoria, nombre, imagen, descripcion, precio, disponibilidad, ventas, ofertas) {
    const [result] = await pool.query(
        'UPDATE productos SET categoria = ?, nombre = ?, imagen = ?, descripcion = ?, precio = ?, disponibilidad = ?, ventas = ?, ofertas = ? WHERE id = ?',
        [categoria, nombre, imagen, descripcion, precio, disponibilidad, ventas, ofertas, id]
    );
    return result.affectedRows;
}

//obtener ventas por categoria
async function getVentasCategoria() {
    //ejecuta una consulta SQL, donde agrupa todos los productos por si categoria
    const [rows] = await pool.query(`
        SELECT categoria, SUM(ventas) AS total_vendido
        FROM productos
        GROUP BY categoria;
    `);
    //devuelve categoria: "Miel Pura", totalVentas:120
    return rows;    
}

//obtener total de ventas
async function getTotalVentas() {
    const [rows] = await pool.query(`
        SELECT SUM(ventas) AS totalVentas
        FROM productos;
    `);
    return rows[0]; 
}

//obtiene la disponibilidad de cada producto
async function getDisponibilidad() {
    const [rows] = await pool.query(`
        SELECT id, categoria, nombre, disponibilidad 
        FROM productos
        ORDER BY categoria, nombre;
    `);
    return rows;
}
async function filtrarProductos(filtros) {
  let { categoria, min, max, ofertas, search } = filtros;

  let sql = "SELECT * FROM productos WHERE 1=1";
  const params = [];

  // Filtro de texto
  if (search) {
    sql += " AND (LOWER(nombre) LIKE ? OR LOWER(descripcion) LIKE ?)";
    params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
  }

  // Filtro de categoria
  if (categoria) {
    sql += " AND categoria = ?";
    params.push(categoria);
  }

  // Filtros de precio
  if (min) {
    sql += " AND precio >= ?";
    params.push(Number(min));
  }
  if (max) {
    sql += " AND precio <= ?";
    params.push(Number(max));
  }

  // Solo ofertas (1 = aplica)
  if (ofertas == 1) {
    sql += " AND ofertas = 1";
  }

  const [rows] = await pool.query(sql, params);
  return rows;
}

module.exports = {
    getAllProductos,
    getProductoId,
    postProducto,
    deleteProducto,
    putProducto,
    getVentasCategoria,
    getTotalVentas,
    getDisponibilidad,
    filtrarProductos
};