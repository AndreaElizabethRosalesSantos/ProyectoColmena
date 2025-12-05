// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');
const blockearLoggeado = require("../middlewares/userMiddleware");
const validateCaptcha = require('../middlewares/captchaMiddleware'); // Nueva importación

// Ruta para generar captcha (para el frontend)
router.get('/captcha/login', userController.generarCaptcha);

// Ruta para validar captcha independiente
router.post('/captcha/validate', userController.validarCaptcha);

// Ruta de login normal (sin captcha)
router.post('/login', blockearLoggeado, userController.getUserByCount);

// Ruta de login seguro (con captcha obligatorio)
router.post('/login-secure', blockearLoggeado, validateCaptcha, userController.loginWithCaptcha);

// Ruta de registro
router.post('/register', blockearLoggeado, userController.createUser);

router.post('/logout', userController.logout);
// Ruta para actualizar usuario
router.put('/:id', userController.updateUser);

module.exports = router;