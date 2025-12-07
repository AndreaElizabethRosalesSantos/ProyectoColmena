// controllers/carritoController.js
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

        // Verificar si el producto existe
        const producto = await productoModel.getProductoId(productoId);
        if (!producto) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }

        // Verificar disponibilidad
        if (producto.disponibilidad < cantidad) {
            return res.status(400).json({ 
                mensaje: `Solo hay ${producto.disponibilidad} unidades disponibles` 
            });
        }

        // Verificar si ya está en el carrito
        const existe = await carritoModel.productoEnCarrito(usuarioId, productoId);
        let itemId;
        
        if (existe) {
            // Actualizar cantidad si ya existe
            const nuevaCantidad = existe.cantidad + cantidad;
            if (producto.disponibilidad < nuevaCantidad) {
                return res.status(400).json({ 
                    mensaje: `No hay suficiente inventario. Máximo disponible: ${producto.disponibilidad}` 
                });
            }
            await carritoModel.actualizarCantidadCarrito(existe.id, nuevaCantidad);
            itemId = existe.id;
        } else {
            // Agregar nuevo item
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

// API – Obtener el carrito del usuario (CON CUPONES)
const obtenerCarrito = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const { codigoCupon } = req.query; // NUEVO: recibir cupón por query
        
        if (!usuarioId) {
            return res.status(400).json({ mensaje: 'usuarioId es requerido' });
        }

        const carrito = await carritoModel.obtenerCarritoUsuario(usuarioId);
        
        // Calcular subtotal por item y total general
        let subtotal = 0;
        const carritoConSubtotal = carrito.map(item => {
            const itemSubtotal = item.precio * item.cantidad;
            subtotal += itemSubtotal;
            return { 
                ...item, 
                subtotal: parseFloat(itemSubtotal.toFixed(2))
            };
        });

        // Calcular impuestos
        const impuestos = subtotal * 0.16;
        
        // NUEVO: Calcular descuento si hay cupón
        let descuento = 0;
        let cuponAplicado = null;
        
        if (codigoCupon) {
            const cuponModel = require('../model/cuponModel');
            const cupon = await cuponModel.validarCupon(codigoCupon.trim().toUpperCase());
            if (cupon) {
                descuento = subtotal * (cupon.descuento / 100);
                cuponAplicado = {
                    codigo: cupon.codigo,
                    porcentaje: cupon.descuento
                };
            }
        }
        
        const total = subtotal + impuestos - descuento;

        res.json({
            items: carritoConSubtotal,
            resumen: {
                totalItems: carrito.length,
                subtotal: parseFloat(subtotal.toFixed(2)),
                impuestos: parseFloat(impuestos.toFixed(2)),
                descuento: parseFloat(descuento.toFixed(2)),
                cupon: cuponAplicado,
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

        // Obtener el item para verificar disponibilidad
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
        
        // Verificar disponibilidad
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

// API – Calcular totales, impuestos y descuentos
const calcularTotales = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const { codigoCupon } = req.query; // NUEVO
        
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

        // Calcular subtotal
        let subtotal = 0;
        carrito.forEach(item => {
            subtotal += item.precio * item.cantidad;
        });

        // Calcular impuestos (16% IVA)
        const impuestos = subtotal * 0.16;
        
        // NUEVO: Calcular descuento si hay cupón
        let descuento = 0;
        let cuponAplicado = null;
        
        if (codigoCupon) {
            const cuponModel = require('../model/cuponModel');
            const cupon = await cuponModel.validarCupon(codigoCupon.trim().toUpperCase());
            if (cupon) {
                descuento = subtotal * (cupon.descuento / 100);
                cuponAplicado = {
                    codigo: cupon.codigo,
                    porcentaje: cupon.descuento
                };
            }
        }
        
        const total = subtotal + impuestos - descuento;

        res.json({
            subtotal: parseFloat(subtotal.toFixed(2)),
            impuestos: parseFloat(impuestos.toFixed(2)),
            descuento: parseFloat(descuento.toFixed(2)),
            cupon: cuponAplicado,
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

        // Verificar que usuario exista
        const pool = require('../db/conexion');
        const [usuarios] = await pool.query(
            'SELECT id FROM users WHERE id = ?',
            [usuarioId]
        );
        
        if (usuarios.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const ordenes = await carritoModel.obtenerOrdenesUsuario(usuarioId);
        
        // Obtener detalles de cada orden
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

// API – Crear orden (CON CUPONES)
const crearOrden = async (req, res) => {
    const pool = require('../db/conexion');
    let connection;
    
    try {
        const { usuarioId } = req.params;
        const { codigoCupon } = req.body; // NUEVO: Recibir cupón
        
        if (!usuarioId) {
            return res.status(400).json({ mensaje: 'usuarioId es requerido' });
        }

        // 1. Obtener información del usuario
        const [usuarios] = await pool.query(
            'SELECT * FROM users WHERE id = ?',
            [usuarioId]
        );
        
        if (usuarios.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        
        const usuario = usuarios[0];

        // 2. Obtener carrito del usuario
        const itemsCarrito = await carritoModel.obtenerItemsParaOrden(usuarioId);
        
        if (itemsCarrito.length === 0) {
            return res.status(400).json({ mensaje: 'Carrito vacío' });
        }

        // 3. Calcular subtotal
        let subtotal = 0;
        itemsCarrito.forEach(item => {
            subtotal += item.precio * item.cantidad;
        });
        
        const impuestos = subtotal * 0.16;
        
        // 4. NUEVO: Validar y aplicar cupón
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

        // 5. Iniciar transacción
        connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 6. Verificar inventario y descontar
            for (const item of itemsCarrito) {
                // Verificar disponibilidad con bloqueo de fila
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
                
                // Descontar inventario
                const [updateResult] = await connection.query(
                    'UPDATE productos SET disponibilidad = disponibilidad - ?, ventas = ventas + ? WHERE id = ?',
                    [item.cantidad, item.cantidad, item.producto_id]
                );
                
                if (updateResult.affectedRows === 0) {
                    throw new Error(`Error al actualizar inventario del producto ${item.producto_id}`);
                }
            }

            // 7. Crear la orden en la BD (con información de descuento)
            const [ordenResult] = await connection.query(
                'INSERT INTO ordenes (usuario_id, subtotal, descuento, cupon_codigo, total, impuestos) VALUES (?, ?, ?, ?, ?, ?)',
                [usuarioId, subtotal, descuento, cuponAplicado?.codigo || null, total, impuestos]
            );
            
            const ordenId = ordenResult.insertId;

            // 8. Crear detalles de la orden
            for (const item of itemsCarrito) {
                await connection.query(
                    'INSERT INTO orden_detalles (orden_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                    [ordenId, item.producto_id, item.cantidad, item.precio]
                );
            }

            // 9. Vaciar el carrito
            await connection.query(
                'DELETE FROM carrito WHERE usuario_id = ?',
                [usuarioId]
            );

            // 10. Commit de la transacción
            await connection.commit();

            // 11. Obtener información completa de la orden creada
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

            // 12. Responder con éxito
            res.status(201).json({
                mensaje: 'Orden creada exitosamente',
                orden: {
                    id: ordenId,
                    usuario_id: usuarioId,
                    subtotal: parseFloat(subtotal.toFixed(2)),
                    impuestos: parseFloat(impuestos.toFixed(2)),
                    descuento: parseFloat(descuento.toFixed(2)),
                    total: parseFloat(total.toFixed(2)),
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
            // Rollback en caso de error
            if (connection) {
                await connection.rollback();
            }
            throw error;
        }

    } catch (error) {
        console.error('Error al crear orden:', error);
        
        // Error específico por inventario insuficiente
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