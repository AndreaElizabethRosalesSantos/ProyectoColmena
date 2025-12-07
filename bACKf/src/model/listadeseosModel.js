const pool = require('../db/conexion');

module.exports = {
  async agregar(usuarioId, productoId) {
    const sql = `
      INSERT IGNORE INTO listadeseos (usuarioId, productoId)
      VALUES (?, ?)
    `;
    return pool.query(sql, [usuarioId, productoId]);
  },

  async obtener(usuarioId) {
    const sql = `
      SELECT p.*
      FROM listadeseos w
      JOIN productos p ON p.id = w.productoId
      WHERE w.usuarioId = ?
    `;
    const [rows] = await pool.query(sql, [usuarioId]);
    return rows;
  },

  // ELIMINAR
  async eliminar(usuarioId, productoId) {
    const sql = `
      DELETE FROM listadeseos 
      WHERE usuarioId = ? AND productoId = ?
    `;
    const [result] = await pool.query(sql, [usuarioId, productoId]);
    return result;
  }
};