const validateCaptcha = (req, res, next) => {
    const { captcha } = req.body;
    const savedCaptcha = req.session.captcha;
    
    if (!savedCaptcha) {
        return res.status(400).json({
            success: false,
            message: 'Sesión de captcha expirada. Recarga la página.'
        });
    }
    
    if (!captcha) {
        return res.status(400).json({
            success: false,
            message: 'El captcha es requerido'
        });
    }
    
    if (captcha.toLowerCase() !== savedCaptcha.toLowerCase()) {
        delete req.session.captcha;
        return res.status(400).json({
            success: false,
            message: 'Captcha incorrecto'
        });
    }
    
    delete req.session.captcha;
    next();
};

module.exports = validateCaptcha;