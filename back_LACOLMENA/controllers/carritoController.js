// controllers/carritoController.js - VERSION SIMPLIFICADA SIN CUPONES EN OBTENER
const carritoModel = require('../model/carritoModel');
const productoModel = require('../model/productoModel');

// API – Agregar un producto al carrito
const agregarAlCarrito = async (req, res) => {
    try {
        const { usuarioId, productoId, cantidad = 1 } = req.body;
        
        if (!usuarioId || !productoId) {
            return res.status(400).json({ 
                mensaje: 'Faltan datos: usuarioId y productoId son obligatorios' 
            });
        }

        const producto = await productoModel.getProductoId(productoId);
        if (!producto) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }

        if (producto.disponibilidad < cantidad) {
            return res.status(400).json({ 
                mensaje: `Solo hay ${producto.disponibilidad} unidades disponibles` 
            });
        }

        const existe = await carritoModel.productoEnCarrito(usuarioId, productoId);
        let itemId;
        
        if (existe) {
            const nuevaCantidad = existe.cantidad + cantidad;
            if (producto.disponibilidad < nuevaCantidad) {
                return res.status(400).json({ 
                    mensaje: `No hay suficiente inventario. Máximo disponible: ${producto.disponibilidad}` 
                });
            }
            await carritoModel.actualizarCantidadCarrito(existe.id, nuevaCantidad);
            itemId = existe.id;
        } else {
            itemId = await carritoModel.agregarItemCarrito(usuarioId, productoId, cantidad);
        }
        
        res.status(201).json({ 
            mensaje: 'Producto agregado al carrito', 
            itemId,
            accion: existe ? 'actualizado' : 'creado'
        });
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        res.status(500).json({ mensaje: 'Error al agregar al carrito', error: error.message });
    }
};

// API – Obtener el carrito del usuario (SIN CUPONES AUTOMÁTICOS)
const obtenerCarrito = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        
        if (!usuarioId) {
            return res.status(400).json({ mensaje: 'usuarioId es requerido' });
        }

        const carrito = await carritoModel.obtenerCarritoUsuario(usuarioId);
        
        let subtotal = 0;
        const carritoConSubtotal = carrito.map(item => {
            const itemSubtotal = item.precio * item.cantidad;
            subtotal += itemSubtotal;
            return { 
                ...item, 
                subtotal: parseFloat(itemSubtotal.toFixed(2))
            };
        });

        // Calcular impuestos (sin descuento por ahora)
        const impuestos = subtotal * 0.16;
        const total = subtotal + impuestos;

        res.json({
            items: carritoConSubtotal,
            resumen: {
                totalItems: carrito.length,
                subtotal: parseFloat(subtotal.toFixed(2)),
                impuestos: parseFloat(impuestos.toFixed(2)),
                descuento: 0,
                total: parseFloat(total.toFixed(2))
            }
        });
    } catch (error) {
        console.error('Error al obtener carrito:', error);
        res.status(500).json({ mensaje: 'Error al obtener carrito', error: error.message });
    }
};

// API – Actualizar la cantidad de un producto
const actualizarCantidad = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { cantidad } = req.body;
        
        if (!cantidad || cantidad < 1) {
            return res.status(400).json({ 
                mensaje: 'Cantidad debe ser mayor a 0' 
            });
        }

        const pool = require('../db/conexion');
        const [items] = await pool.query(`
            SELECT c.*, p.disponibilidad 
            FROM carrito c 
            JOIN productos p ON c.producto_id = p.id 
            WHERE c.id = ?
        `, [itemId]);
        
        if (items.length === 0) {
            return res.status(404).json({ mensaje: 'Item no encontrado en carrito' });
        }

        const item = items[0];
        
        if (item.disponibilidad < cantidad) {
            return res.status(400).json({ 
                mensaje: `Solo hay ${item.disponibilidad} unidades disponibles` 
            });
        }

        const filas = await carritoModel.actualizarCantidadCarrito(itemId, cantidad);
        
        if (filas === 0) {
            return res.status(404).json({ mensaje: 'Item no encontrado' });
        }

        res.json({ 
            mensaje: 'Cantidad actualizada correctamente',
            cantidad: parseInt(cantidad)
        });
    } catch (error) {
        console.error('Error al actualizar cantidad:', error);
        res.status(500).json({ mensaje: 'Error al actualizar cantidad', error: error.message });
    }
};

// API – Eliminar un producto del carrito
const eliminarDelCarrito = async (req, res) => {
    try {
        const { itemId } = req.params;
        
        const filas = await carritoModel.eliminarItemCarrito(itemId);
        
        if (filas === 0) {
            return res.status(404).json({ mensaje: 'Item no encontrado' });
        }

        res.json({ mensaje: 'Producto eliminado del carrito' });
    } catch (error) {
        console.error('Error al eliminar del carrito:', error);
        res.status(500).json({ mensaje: 'Error al eliminar del carrito', error: error.message });
    }
};

// API – Vaciar todo el carrito
const vaciarCarrito = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        
        if (!usuarioId) {
            return res.status(400).json({ mensaje: 'usuarioId es requerido' });
        }

        const filas = await carritoModel.vaciarCarritoUsuario(usuarioId);
        
        res.json({ 
            mensaje: 'Carrito vaciado correctamente',
            itemsEliminados: filas 
        });
    } catch (error) {
        console.error('Error al vaciar carrito:', error);
        res.status(500).json({ mensaje: 'Error al vaciar carrito', error: error.message });
    }
};

// API – Calcular totales (SIN CUPONES AUTOMÁTICOS)
const calcularTotales = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        
        if (!usuarioId) {
            return res.status(400).json({ mensaje: 'usuarioId es requerido' });
        }

        const carrito = await carritoModel.obtenerCarritoUsuario(usuarioId);
        
        if (carrito.length === 0) {
            return res.json({
                subtotal: 0,
                impuestos: 0,
                descuento: 0,
                total: 0,
                mensaje: 'Carrito vacío'
            });
        }

        let subtotal = 0;
        carrito.forEach(item => {
            subtotal += item.precio * item.cantidad;
        });

        const impuestos = subtotal * 0.16;
        const total = subtotal + impuestos;

        res.json({
            subtotal: parseFloat(subtotal.toFixed(2)),
            impuestos: parseFloat(impuestos.toFixed(2)),
            descuento: 0,
            total: parseFloat(total.toFixed(2)),
            itemsCount: carrito.length
        });
    } catch (error) {
        console.error('Error al calcular totales:', error);
        res.status(500).json({ mensaje: 'Error al calcular totales', error: error.message });
    }
};

// API – Obtener órdenes del usuario
const obtenerOrdenes = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        
        if (!usuarioId) {
            return res.status(400).json({ mensaje: 'usuarioId es requerido' });
        }

        const pool = require('../db/conexion');
        const [usuarios] = await pool.query(
            'SELECT id FROM users WHERE id = ?',
            [usuarioId]
        );
        
        if (usuarios.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const ordenes = await carritoModel.obtenerOrdenesUsuario(usuarioId);
        
        const ordenesConDetalles = await Promise.all(
            ordenes.map(async (orden) => {
                const [detalles] = await pool.query(`
                    SELECT od.*, p.nombre, p.imagen 
                    FROM orden_detalles od 
                    JOIN productos p ON od.producto_id = p.id 
                    WHERE od.orden_id = ?
                `, [orden.id]);
                
                return {
                    ...orden,
                    detalles: detalles
                };
            })
        );
        
        res.json({
            ordenes: ordenesConDetalles,
            totalOrdenes: ordenes.length
        });
    } catch (error) {
        console.error('Error al obtener órdenes:', error);
        res.status(500).json({ mensaje: 'Error al obtener órdenes', error: error.message });
    }
};

// API – Crear orden (CON SOPORTE PARA CUPONES)
const crearOrden = async (req, res) => {
    const pool = require('../db/conexion');
    let connection;
    
    try {
        const { usuarioId } = req.params;
        const { codigoCupon } = req.body; // Código de cupón opcional
        
        if (!usuarioId) {
            return res.status(400).json({ mensaje: 'usuarioId es requerido' });
        }

        const [usuarios] = await pool.query(
            'SELECT * FROM users WHERE id = ?',
            [usuarioId]
        );
        
        if (usuarios.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        
        const usuario = usuarios[0];

        const itemsCarrito = await carritoModel.obtenerItemsParaOrden(usuarioId);
        
        if (itemsCarrito.length === 0) {
            return res.status(400).json({ mensaje: 'Carrito vacío' });
        }

        // Calcular subtotal
        let subtotal = 0;
        itemsCarrito.forEach(item => {
            subtotal += item.precio * item.cantidad;
        });
        
        const impuestos = subtotal * 0.16;
        
        // Validar cupón si se proporcionó
        let descuento = 0;
        let cuponAplicado = null;
        
        if (codigoCupon) {
            const cuponModel = require('../model/cuponModel');
            const cupon = await cuponModel.validarCupon(codigoCupon.trim().toUpperCase());
            if (cupon) {
                descuento = subtotal * (cupon.descuento / 100);
                cuponAplicado = {
                    codigo: cupon.codigo,
                    porcentaje: cupon.descuento,
                    monto: descuento
                };
            }
        }
        
        const total = subtotal + impuestos - descuento;

        connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Verificar inventario
            for (const item of itemsCarrito) {
                const [producto] = await connection.query(
                    'SELECT disponibilidad FROM productos WHERE id = ? FOR UPDATE',
                    [item.producto_id]
                );
                
                if (producto.length === 0) {
                    throw new Error(`Producto ${item.producto_id} no encontrado`);
                }
                
                if (producto[0].disponibilidad < item.cantidad) {
                    throw new Error(`Producto "${item.nombre}" sin suficiente inventario. Disponible: ${producto[0].disponibilidad}, Solicitado: ${item.cantidad}`);
                }
                
                await connection.query(
                    'UPDATE productos SET disponibilidad = disponibilidad - ?, ventas = ventas + ? WHERE id = ?',
                    [item.cantidad, item.cantidad, item.producto_id]
                );
            }

            // Crear la orden
            const [ordenResult] = await connection.query(
                'INSERT INTO ordenes (usuario_id, total, impuestos) VALUES (?, ?, ?)',
                [usuarioId, total, impuestos]
            );
            
            const ordenId = ordenResult.insertId;

            // Crear detalles de la orden
            for (const item of itemsCarrito) {
                await connection.query(
                    'INSERT INTO orden_detalles (orden_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                    [ordenId, item.producto_id, item.cantidad, item.precio]
                );
            }

            // Vaciar el carrito
            await connection.query(
                'DELETE FROM carrito WHERE usuario_id = ?',
                [usuarioId]
            );

            await connection.commit();

            const [ordenCreada] = await connection.query(
                'SELECT * FROM ordenes WHERE id = ?',
                [ordenId]
            );
            
            const [detallesOrden] = await connection.query(
                `SELECT od.*, p.nombre 
                 FROM orden_detalles od 
                 JOIN productos p ON od.producto_id = p.id 
                 WHERE od.orden_id = ?`,
                [ordenId]
            );

            res.status(201).json({
                mensaje: 'Orden creada exitosamente',
                orden: {
                    id: ordenId,
                    usuario_id: usuarioId,
                    subtotal: subtotal,
                    impuestos: impuestos,
                    descuento: descuento,
                    total: total,
                    cupon: cuponAplicado,
                    detalles: detallesOrden.map(detalle => ({
                        producto_id: detalle.producto_id,
                        nombre: detalle.nombre,
                        cantidad: detalle.cantidad,
                        precio_unitario: detalle.precio_unitario,
                        subtotal: detalle.cantidad * detalle.precio_unitario
                    }))
                },
                usuario: {
                    id: usuario.id,
                    nombre: usuario.NomComplete || usuario.Usuario,
                    email: usuario.Email
                }
            });

        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
            throw error;
        }

    } catch (error) {
        console.error('Error al crear orden:', error);
        
        if (error.message.includes('inventario')) {
            return res.status(400).json({ 
                mensaje: 'Error de inventario',
                error: error.message 
            });
        }
        
        res.status(500).json({ 
            mensaje: 'Error al crear orden',
            error: error.message 
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    agregarAlCarrito,
    obtenerCarrito,
    actualizarCantidad,
    eliminarDelCarrito,
    vaciarCarrito,
    calcularTotales,
    obtenerOrdenes,
    crearOrden
};