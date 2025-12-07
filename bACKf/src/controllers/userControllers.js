const UserModel = require('../model/UserModel');
const jwt = require('jsonwebtoken');
const { comparePassword } = require("../helpers/password");
const pool = require('../db/conexion');
const { generateCaptcha, validateCaptcha } = require('../helpers/captcha'); // Nueva importación

const JWT_SECRET = process.env.JWT_SECRET || 'nuestra_clave_colmena';

// Login normal (sin captcha)
const getUserByCount = async (req, res) => {
    try {
        const { usuario, contrasena } = req.body;

        if (!usuario || !contrasena) {
            return res.status(400).json({
                success: false,
                message: 'Usuario y contraseña son requeridos'
            });
        }

        const cuenta = await UserModel.getUserByCount(usuario);

        if (!cuenta) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Ver bloqueo
        const ahora = new Date();
        if (cuenta.bloqueo_hasta && ahora < new Date(cuenta.bloqueo_hasta)) {
            const tiempoRest = Math.ceil((new Date(cuenta.bloqueo_hasta) - ahora) / 60000);
            return res.status(403).json({
                success: false,
                message: `Usuario bloqueado. Inténtalo en ${tiempoRest} minutos.`
            });
        }

        // Verificar contraseña
        const passwordOK = await comparePassword(contrasena, cuenta.contrasena);

        if (!passwordOK) {
            await UserModel.strikeUserByName(usuario);
            const target = await UserModel.getUserByName(usuario);

            if (target.fallos >= 3) {
                const bloqueo_hasta = new Date(Date.now() + (5 * 60 * 1000));
                await UserModel.intentosFallidos(usuario, bloqueo_hasta);
            }

            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas. Fallo sumado.'
            });
        }

        // Resetear fallos
        await pool.query("UPDATE users SET fallos = 0, bloqueo_hasta = NULL WHERE usuario = ?", [usuario]);

        // Crear token
        const token = jwt.sign(
            { usuario: usuario, userId: cuenta.id },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            success: true,
            message: 'Login exitoso',
            token,
            usuario: {
                id: cuenta.id,          // ✅ Añade el ID
                usuario: cuenta.Usuario // ✅ Usa cuenta.Usuario en lugar del parámetro
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Login CON captcha
const loginWithCaptcha = async (req, res) => {
    try {
        const { usuario, contrasena, captchaToken, captchaText } = req.body;

        // Validar campos requeridos
        if (!usuario || !contrasena) {
            return res.status(400).json({
                success: false,
                message: 'Usuario y contraseña son requeridos'
            });
        }

        // Validar captcha
        if (!captchaToken || !captchaText) {
            return res.status(400).json({
                success: false,
                message: 'CAPTCHA requerido'
            });
        }

        const captchaValidation = validateCaptcha(captchaToken, captchaText);
        if (!captchaValidation.valid) {
            return res.status(400).json({
                success: false,
                message: captchaValidation.error
            });
        }

        const cuenta = await UserModel.getUserByCount(usuario);

        if (!cuenta) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Ver bloqueo
        const ahora = new Date();
        if (cuenta.bloqueo_hasta && ahora < new Date(cuenta.bloqueo_hasta)) {
            const tiempoRest = Math.ceil((new Date(cuenta.bloqueo_hasta) - ahora) / 60000);
            return res.status(403).json({
                success: false,
                message: `Usuario bloqueado. Inténtalo en ${tiempoRest} minutos.`
            });
        }

        const passwordOK = await comparePassword(contrasena, cuenta.Contrasena);

        if (!passwordOK) {
            await UserModel.strikeUserByName(usuario);
            const target = await UserModel.getUserByName(usuario);

            if (target.fallos >= 3) {
                const bloqueo_hasta = new Date(Date.now() + (5 * 60 * 1000));
                await UserModel.intentosFallidos(usuario, bloqueo_hasta);
            }

            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas. Fallo sumado.'
            });
        }

        // Resetear fallos
        await pool.query("UPDATE users SET fallos = 0, bloqueo_hasta = NULL WHERE usuario = ?", [usuario]);

        const token = jwt.sign(
            { usuario: usuario, userId: cuenta.id },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            success: true,
            message: 'Login exitoso',
            token,
            usuario: {
                id: cuenta.id,          // ✅ Añade el ID
                usuario: cuenta.Usuario // ✅ Usa cuenta.Usuario
            }
        });

    } catch (error) {
        console.error('Error en login con captcha:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Generar nuevo captcha
const generarCaptcha = async (req, res) => {
    try {
        const captchaData = generateCaptcha();

        console.log('✅ CAPTCHA generado. ID:', captchaData.captchaId);

        return res.json({
            success: true,
            captchaId: captchaData.captchaId,
            token: captchaData.token,
            svg: captchaData.svg
        });
    } catch (error) {
        console.error('Error generando captcha:', error);
        return res.status(500).json({
            success: false,
            message: 'Error generando CAPTCHA'
        });
    }
};

// Validar captcha (para uso independiente)
const validarCaptcha = async (req, res) => {
    try {
        const { token, texto } = req.body;

        if (!token || !texto) {
            return res.status(400).json({
                success: false,
                message: 'Token y texto del CAPTCHA requeridos'
            });
        }

        const result = validateCaptcha(token, texto);

        if (result.valid) {
            return res.json({
                success: true,
                message: 'CAPTCHA válido',
                captchaId: result.captchaId
            });
        } else {
            return res.status(400).json({
                success: false,
                message: result.error
            });
        }
    } catch (error) {
        console.error('Error validando captcha:', error);
        return res.status(500).json({
            success: false,
            message: 'Error validando CAPTCHA'
        });
    }
};

// Resto de las funciones permanecen igual...
const createUser = async (req, res) => {
    try {
        console.log(req.body);
        const { nomCompleto, usuario, email, contrasena1, contrasena2, telefono, direccion } = req.body;
        if (!nomCompleto || !usuario || !contrasena1 || !contrasena2 || !telefono || !direccion)
            return res.status(400).json({ mensaje: 'Faltan datos obligatorios' })
        if (contrasena1 !== contrasena2)
            return res.status(400).json({ mensaje: 'Error: las contraseñas no coinciden' })
        console.log("1");
        const id_insertado = await UserModel.createUser(nomCompleto, usuario, email, contrasena1, telefono, direccion);
        res.status(201).json({ mensaje: 'Usuario creado', id_insertado });
        console.log("2");
    } catch (error) {
        console.error('Error al agregar usuario:', error);
        res.status(500).json({ mensaje: 'Error al agregar usuario' });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { contrasena } = req.body;

        const cuenta = await UserModel.updateUser(id, contrasena);

        if (cuenta === 0)
            return res.status(404).json({ mensaje: 'User no encontrado' });

        res.json({ mensaje: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ mensaje: 'Error al actualizar usuario' });
    }
};

const logout = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: 'Sesión cerrada exitosamente'
        });

    } catch (error) {
        console.error('Error en logout:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};
module.exports = {
    getUserByCount,
    createUser,
    updateUser,
    generarCaptcha,
    validarCaptcha,
    loginWithCaptcha,
    logout
};