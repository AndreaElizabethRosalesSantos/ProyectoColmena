// routes/productosRoutes.js
const express = require('express');
const router = express.Router();

//Rutas relacionadas con los productos
const {
    //ADMINITRADOR
    getProductos,           //mostrar productos
    getProductoId,          //mostrar producto segun id
    postProducto,           //crear producto
    deleteProducto,         //eliminar producto
    putProducto,            //actualizar producto
    getVentasCategoria,     //suma las ventas por categorias
    getTotalVentas,         //suma las ventas totales 
    getDisponibilidad       //obtiene disponibilidad del producto
} = require('../controllers/productosController');

router.get('/', getProductos );
router.get('/ventasCategoria', getVentasCategoria);
router.get('/totalVentas', getTotalVentas);
router.get('/inventario', getDisponibilidad);
router.get('/:id', getProductoId );
router.post('/postProducto', postProducto );
router.delete('/:id', deleteProducto );
router.put('/:id', putProducto );

module.exports = router;