const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "nuestra_clave_colmena";

// Bloquear rutas si ya hay sesión activa
function blockearLoggeado(req, res, next) {
    const authHeader = req.headers.authorization;

    // Si no hay header, permitir login
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next();
    }

    const token = authHeader.split(" ")[1];

    // Si el token está vacío o "null", permitir login
    if (!token || token === "null" || token === "undefined") {
        return next();
    }

    try {
        jwt.verify(token, JWT_SECRET);
        // Token válido → NO permitir entrar al login
        return res.status(403).json({
            success: false,
            message: "Ya tienes sesión activa"
        });
    } catch (err) {
        // Token inválido → permitir login
        return next();
    }
}

module.exports = blockearLoggeado;