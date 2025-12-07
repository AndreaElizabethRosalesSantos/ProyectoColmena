const svgCaptcha = require('svg-captcha');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || 'captcha_secreto_escolar';
const CAPTCHA_EXPIRES_IN = '5m'; // 5 minutos

// Generar un ID único para el captcha
function generateCaptchaId() {
    return crypto.randomBytes(16).toString('hex');
}

// Generar captcha y token firmado
function generateCaptcha() {
    const captcha = svgCaptcha.create({
        size: 5,
        noise: 2,
        color: true,
        background: '#f0f0f0',
        width: 150,
        height: 50,
        fontSize: 40
    });

    const captchaId = generateCaptchaId();
    
    // Crear token JWT con el texto del captcha
    const token = jwt.sign(
        { 
            captchaId, 
            text: captcha.text.toLowerCase(), // Guardar en minúsculas
            createdAt: Date.now() 
        },
        CAPTCHA_SECRET,
        { expiresIn: CAPTCHA_EXPIRES_IN }
    );

    return {
        captchaId,
        token,
        svg: captcha.data
    };
}

// Validar captcha
function validateCaptcha(userToken, userInput) {
    try {
        if (!userToken || !userInput) {
            return { valid: false, error: 'Token o texto faltante' };
        }

        // Verificar el token
        const decoded = jwt.verify(userToken, CAPTCHA_SECRET);
        
        // Comparar el texto (ambos en minúsculas)
        const isValid = decoded.text === userInput.toLowerCase().trim();
        
        return {
            valid: isValid,
            error: isValid ? null : 'CAPTCHA incorrecto',
            captchaId: decoded.captchaId
        };
    } catch (error) {
        return { 
            valid: false, 
            error: error.name === 'TokenExpiredError' 
                ? 'CAPTCHA expirado' 
                : 'Token inválido' 
        };
    }
}

module.exports = {
    generateCaptcha,
    validateCaptcha
};