// routes/carritoRoutes.js
const express = require('express');
const router = express.Router();

const {
    agregarAlCarrito,
    obtenerCarrito,
    actualizarCantidad,
    eliminarDelCarrito,
    vaciarCarrito,
    calcularTotales,
    obtenerOrdenes,
    crearOrden
} = require('../controllers/carritoController');

// Rutas del carrito
router.post('/agregar', agregarAlCarrito);                // POST /api/carrito/agregar
router.get('/:usuarioId', obtenerCarrito);                // GET /api/carrito/:usuarioId
router.put('/actualizar/:itemId', actualizarCantidad);    // PUT /api/carrito/actualizar/:itemId
router.delete('/eliminar/:itemId', eliminarDelCarrito);   // DELETE /api/carrito/eliminar/:itemId
router.delete('/vaciar/:usuarioId', vaciarCarrito);       // DELETE /api/carrito/vaciar/:usuarioId

// Rutas de totales y órdenes
router.get('/totales/:usuarioId', calcularTotales);       // GET /api/carrito/totales/:usuarioId
router.get('/ordenes/:usuarioId', obtenerOrdenes);        // GET /api/carrito/ordenes/:usuarioId
router.post('/crear-orden/:usuarioId', crearOrden);       // POST /api/carrito/crear-orden/:usuarioId

module.exports = router;