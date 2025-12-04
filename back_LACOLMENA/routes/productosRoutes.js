// routes/prodcutosRoutes.js
const express = require('express');
const router = express.Router();

//Rutas relacionadas con los productos
const {
    //ADMINITRADOR
    getProductos,           //mostrar productos
    getProductoId,          //mostrar producto segun id
    postProducto,           //crear producto
    deleteProducto,         //eliminar producto
    putProducto             //actualizar producto
} = require('../controllers/productosController');

router.get('/', getProductos );
router.get('/:id', getProductoId );
router.post('/postProducto', postProducto );
router.delete('/:id', deleteProducto );
router.put('/:id', putProducto );

module.exports = router;