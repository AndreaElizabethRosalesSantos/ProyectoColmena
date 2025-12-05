const UserModel = require('../model/UserModel');
const jwt = require('jsonwebtoken');
const { comparePassword } = require("../helpers/password");
const pool = require('../db/conexion'); 
const JWT_SECRET = process.env.JWT_SECRET || 'nuestra_clave_colmena';


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
                usuario: usuario
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
                usuario: usuario
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
const generarCaptcha = async (req, res) => {
    //Genera una captcha
    const captcha = svgCaptcha.create({
        size: 6,
        noise: 3,
        color: true,
        background: '#f0f0f0'
    });

    req.session.captcha = captcha.text;
    console.log('✅ CAPTCHA generado:', captcha.text);

    res.json({
        svg: captcha.data
    });
};

const validarCaptcha = async (req, res) => {
    const userCaptcha = req.body.captcha;
    const savedCaptcha = req.session.captcha;

    console.log('Body recibido:', req.body);
    console.log('CAPTCHA en sesión:', savedCaptcha);

    if (!savedCaptcha) {
        return res.json({
            success: false,
            message: 'Error: La sesión expiró. Recarga la página.'
        });
    }

    if (userCaptcha && userCaptcha.toLowerCase() === savedCaptcha.toLowerCase()) {
        delete req.session.captcha;
        return res.json({
            success: true,
            message: 'Validación CAPTCHA exitosa'
        });
    }

    return res.json({
        success: false,
        message: 'CAPTCHA incorrecto. Intenta de nuevo.'
    });
};

const logout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destruyendo sesión:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error cerrando sesión'
                });
            }
            
            // Limpiar cookie de sesión
            res.clearCookie('connect.sid');
            res.clearCookie('sessionId');   
            
            return res.status(200).json({
                success: true,
                message: 'Sesión cerrada exitosamente'
            });
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