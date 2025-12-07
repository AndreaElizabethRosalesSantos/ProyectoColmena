// controllers/cuponController.js - CORREGIDO
const cuponModel = require('../model/cuponModel');

// API - Validar cupón
const validarCupon = async (req, res) => {
    try {
        const { codigo } = req.body;
        
        if (!codigo) {
            return res.status(400).json({ 
                valido: false,
                mensaje: 'Código de cupón es requerido' 
            });
        }

        // Convertir a mayúsculas y eliminar espacios
        const codigoLimpio = codigo.trim().toUpperCase();

        // Validar formato: solo letras y números
        const regex = /^[A-Z0-9]+$/;
        if (!regex.test(codigoLimpio)) {
            return res.status(400).json({ 
                valido: false,
                mensaje: 'El código solo debe contener letras y números' 
            });
        }

        // Buscar cupón en la base de datos
        const cupon = await cuponModel.validarCupon(codigoLimpio);

        if (!cupon) {
            return res.json({ 
                valido: false,
                descuento: 0,
                mensaje: 'Cupón no válido o expirado' 
            });
        }

        // Cupón válido
        res.json({ 
            valido: true,
            descuento: parseFloat(cupon.descuento),
            codigo: cupon.codigo,
            mensaje: `¡Cupón aplicado! ${cupon.descuento}% de descuento` 
        });

    } catch (error) {
        console.error('Error al validar cupón:', error);
        res.status(500).json({ 
            valido: false,
            mensaje: 'Error al validar el cupón',
            error: error.message 
        });
    }
};

// API - Crear cupón inicial (solo para setup, ejecutar una vez)
const crearCuponInicial = async (req, res) => {
    try {
        const cupon = {
            codigo: 'DESCUENTO10',
            descuento: 10.00,
            activo: 1
        };

        // Verificar si ya existe
        const existe = await cuponModel.obtenerCuponPorCodigo(cupon.codigo);
        
        if (existe) {
            return res.json({ 
                mensaje: 'El cupón ya existe',
                cupon: existe 
            });
        }

        const cuponId = await cuponModel.crearCupon(
            cupon.codigo, 
            cupon.descuento, 
            cupon.activo
        );

        res.status(201).json({ 
            mensaje: 'Cupón creado exitosamente',
            cuponId,
            cupon 
        });

    } catch (error) {
        console.error('Error al crear cupón:', error);
        res.status(500).json({ 
            mensaje: 'Error al crear el cupón',
            error: error.message 
        });
    }
};

// ⚠️ IMPORTANTE: Exportar las funciones
module.exports = {
    validarCupon,
    crearCuponInicial
};