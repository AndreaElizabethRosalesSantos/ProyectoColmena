// routes/cuponRoutes.js - CORREGIDO
const express = require('express');
const router = express.Router();
const cuponController = require('../controllers/cuponController');

// Ruta para validar cupón
router.post('/validar', cuponController.validarCupon);

// Ruta para crear el cupón inicial (ejecutar solo una vez o usar el SQL)
router.post('/crear-inicial', cuponController.crearCuponInicial);

module.exports = router;