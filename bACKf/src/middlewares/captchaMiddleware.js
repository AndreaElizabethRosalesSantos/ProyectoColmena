const { validateCaptcha } = require('../helpers/captcha');

const validateCaptchaMiddleware = (req, res, next) => {
    const { captchaToken, captchaText } = req.body;
    
    if (!captchaToken || !captchaText) {
        return res.status(400).json({
            success: false,
            message: 'CAPTCHA requerido'
        });
    }
    
    const result = validateCaptcha(captchaToken, captchaText);
    
    if (!result.valid) {
        return res.status(400).json({
            success: false,
            message: result.error
        });
    }
    
    // Opcional: guardar el captchaId en el request para uso posterior
    req.captchaId = result.captchaId;
    next();
};

module.exports = validateCaptchaMiddleware;