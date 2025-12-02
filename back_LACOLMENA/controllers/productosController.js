// controllers/productosontroller.js 
const productoModel = require('../model/productoModel'); 
 

// GET /api/productos 
//obtener todos los productos
const getProductos = async (req, res) => { 
  try { 
    const productos = await productoModel.getAllProductos(); 
    res.json(productos); 
  } catch (error) { 
    console.error('Error al obtener productos:', error); 
    res.status(500).json({ mensaje: 'Error al obtener productos' }); 
  } 
}; 

// GET /api/productos/:id 
//obtener producto por id
const getProductoId = async (req, res) => { 
  try { 
    const { id } = req.params; 
    const producto = await productoModel.getProductoId(id); 
 
    if (!producto) 
        return res.status(404).json({ mensaje: 'Producto no encontrado' }); 
        res.json(producto); 
    } catch (error) { 
        console.error('Error al obtener el producto:', error); 
        res.status(500).json({ mensaje: 'Error al obtener el producto' }); 
    } 
}; 

// POST /api/productos 
//agrega un nuevo producto
const postProducto = async (req, res) => { 
  try { 
    console.log(req.body); 
    const {categoria, nombre, imagen, descripcion, precio, disponibilidad, ventas } = req.body; 
    if (!categoria || !nombre || !imagen || !descripcion || !precio || !disponibilidad || !ventas) 
        return res.status(400).json({ mensaje: 'Faltan datos obligatorios' }); 
 
        console.log("1"); 
        const id_insertado = await productoModel.postProducto( categoria, nombre, imagen, descripcion, precio, disponibilidad, ventas); 
        res.status(201).json({ mensaje: 'Libro agregado', id_insertado }); 
        console.log("2"); 
    } catch (error) { 
        console.error('Error al agregar el producto:', error); 
        res.status(500).json({ mensaje: 'Error al agregar el producto' }); 
    } 
}; 

// DELETE /api/productos/:id 
//elimina el productos segun el id
const deleteProducto = async (req, res) => { 
  try { 
    const { id } = req.params; 
    const filas = await productoModel.deleteProducto(id); 
 
    if (filas === 0) 
        return res.status(404).json({ mensaje: 'Producto no encontrado' }); 
 
        res.json({ mensaje: 'Producto eliminado correctamente' }); 
    } catch (error) { 
        console.error('Error al eliminar producto:', error); 
        res.status(500).json({ mensaje: 'Error al eliminar producto' }); 
    } 
}; 

// PUT /api/books/:id
//actualiza el producto 
const putProducto = async (req, res) => { 
  try { 
    const { id } = req.params; 
    const { categoria, nombre, imagen, descripcion, precio, disponibilidad, ventas } = req.body; 
 
    const filas = await productoModel.putProducto(id, categoria, nombre, imagen, descripcion, precio, disponibilidad, ventas); 
    if (filas === 0) 
        return res.status(404).json({ mensaje: 'Producto no encontrado' }); 
    
        res.json({ mensaje: 'Producto actualizado correctamente' }); 
    } catch (error) { 
        console.error('Error al actualizar el producto:', error); 
        res.status(500).json({ mensaje: 'Error al actualizar el producto' });
    
    } 
}; 

module.exports = {
    getProductos,
    getProductoId,
    postProducto,
    deleteProducto,
    putProducto
};
