const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "nuestra_clave_colmena";

// Bloquear rutas si ya hay sesión activa
function blockearLoggeado(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) return next();

    const token = authHeader.split(" ")[1]; // Bearer TOKEN

    try {
        jwt.verify(token, JWT_SECRET);
        // Si token es válido, se bloquea el paso
        return res.status(403).json({
            success: false,
            message: "Ya tienes sesión activa"
        });
    } catch (err) {
        return next(); // Token inválido, no está logueado
    }
}

module.exports = blockearLoggeado;