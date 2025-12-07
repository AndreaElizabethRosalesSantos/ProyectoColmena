const listadeseosModel = require('../model/listadeseosModel');

// AGREGAR
const agregarAListaDeseos = async (req, res) => {
    const { usuarioId, productoId } = req.body;

    if (!usuarioId || !productoId) {
        return res.status(400).json({ ok: false, mensaje: "Faltan datos" });
    }

    try {
        await listadeseosModel.agregar(usuarioId, productoId);
        res.json({ ok: true, mensaje: "Producto agregado a lista de deseos" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: "Error en el servidor" });
    }
};

// OBTENER
const obtenerListaDeseos = async (req, res) => {
    const { usuarioId } = req.params;
    if (!usuarioId || isNaN(usuarioId)) {
        return res.status(400).json({
            ok: false,
            mensaje: "usuarioId inválido"
        });
    }

    try {
        const productos = await listadeseosModel.obtener(usuarioId);
        res.json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: "Error en el servidor" });
    }
};

// ELIMINAR
const eliminarDeListaDeseos = async (req, res) => {
    const { usuarioId, productoId } = req.params;

    // Validar parámetros
    if (!usuarioId || !productoId || isNaN(usuarioId) || isNaN(productoId)) {
        return res.status(400).json({
            ok: false,
            mensaje: "Parámetros inválidos"
        });
    }

    try {
        // Verificar si el producto existe en la lista de deseos
        const productos = await listadeseosModel.obtener(usuarioId);
        const productoExiste = productos.some(p => p.id == productoId);
        
        if (!productoExiste) {
            return res.status(404).json({
                ok: false,
                mensaje: "El producto no está en tu lista de deseos"
            });
        }

        // Eliminar el producto
        const resultado = await listadeseosModel.eliminar(usuarioId, productoId);
        
        // Verificar si se eliminó algo (affectedRows es de MySQL)
        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: "No se pudo eliminar el producto"
            });
        }

        res.json({
            ok: true,
            mensaje: "Producto eliminado de la lista de deseos"
        });
        
    } catch (error) {
        console.error('Error eliminando de lista de deseos:', error);
        res.status(500).json({
            ok: false,
            mensaje: "Error en el servidor",
            error: error.message
        });
    }
};

module.exports = {
    agregarAListaDeseos,
    obtenerListaDeseos,
    eliminarDeListaDeseos
};