// controllers/productosController.js 
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
    const {categoria, nombre, imagen, descripcion, precio, disponibilidad, ventas, ofertas } = req.body; 
    if (!categoria || !nombre || !imagen || !descripcion || !precio || !disponibilidad || !ventas || !ofertas )  
        return res.status(400).json({ mensaje: 'Faltan datos obligatorios' }); 
 
        const id_insertado = await productoModel.postProducto( categoria, nombre, imagen, descripcion, precio, disponibilidad, ventas, ofertas); 
        res.status(201).json({ mensaje: 'Producto agregado', id_insertado }); 
         
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

// PUT /api/productos/:id
//actualiza el producto 
const putProducto = async (req, res) => { 
  try { 
    const { id } = req.params; 
    const { categoria, nombre, imagen, descripcion, precio, disponibilidad, ventas, ofertas } = req.body; 
 
    const filas = await productoModel.putProducto(id, categoria, nombre, imagen, descripcion, precio, disponibilidad, ventas, ofertas ); 
    if (filas === 0) 
        return res.status(404).json({ mensaje: 'Producto no encontrado' }); 
    
        res.json({ mensaje: 'Producto actualizado correctamente' }); 
    } catch (error) { 
        console.error('Error al actualizar el producto:', error); 
        res.status(500).json({ mensaje: 'Error al actualizar el producto' });
    
    } 
}; 

// GET/api/productos/ventasCategoria
//obtiene la suma las ventas por categorias
const getVentasCategoria = async (req, res) => {
  try {
    const ventas = await productoModel.getVentasCategoria();
    res.json(ventas);
  } catch (error) {
    console.error("Error al obtener ventas por categoria:", error);
    res.status(500).json({ mensaje: "Error al obtener ventas por categoria" });
  }
};

// GET/api/productos/totalVentas
//obtiene suma total de las ventas
const getTotalVentas = async (req, res) => {
  try {
      const total = await productoModel.getTotalVentas();
      res.json(total);
  } catch (error) {
      console.error("Error al obtener total de ventas:", error);
      res.status(500).json({ mensaje: "Error al obtener total de ventas" });
  }
};

// GET/api/productos/inventario
//obtiene la disponibilidad de cada producto
const getDisponibilidad = async (req, res) => {
    try {
        const datos = await productoModel.getDisponibilidad();
        res.json(datos);
    } catch (error) {
        console.error("Error al obtener inventario:", error);
        res.status(500).json({ mensaje: "Error al obtener inventario" });
    }
};

// GET /api/productos/filtrar
const filtrarProductos = async (req, res) => {
  try {
    console.log('filtrarProductos ejecutándose');
    console.log('Query params:', req.query);
    
    // Usar la función del modelo que ahora existe
    const productos = await productoModel.filtrarProductos(req.query);
    
    console.log(`Productos encontrados: ${productos.length}`);
    res.json(productos);

  } catch (error) {
    console.error("Error al filtrar productos:", error);
    res.status(500).json({ mensaje: "Error al filtrar productos" });
  }
};

module.exports = {
  getProductos,
  getProductoId,
  postProducto,
  deleteProducto,
  putProducto,
  getVentasCategoria,
  getTotalVentas,
  getDisponibilidad,
  filtrarProductos  
};
