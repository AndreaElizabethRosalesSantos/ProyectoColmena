// routes/suscripcionRoutes.js
const express = require('express');
const router = express.Router();

//Rutas relacionadas con la suscripcion
const { 
    suscribirUsuario       //crea una suscripcion 
} = require('../controllers/suscripcionController');

router.post('/suscribir', suscribirUsuario);

module.exports = router;
