const bcrypt = require("bcryptjs");

// Encriptar (hash)
async function encrypt(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

// Comparar contraseña ingresada vs hash guardado
async function comparePassword(passwordIngresada, hashGuardado) {
    return await bcrypt.compare(passwordIngresada, hashGuardado);
}

module.exports = {
    encrypt,
    comparePassword
};
