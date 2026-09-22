// RegEx para validar contraseñas
// Requisito: Min 8 chars, 1 mayúscula, 1 número
const passRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

// RegEx para validar email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida que la contraseña cumpla requisitos de seguridad
 * @param {string} password - Contraseña a validar
 * @returns {boolean} - True si es válida
 */
const validarPassword = (password) => {
    return passRegex.test(password);
};

/**
 * Valida que el email tenga formato correcto
 * @param {string} email - Email a validar
 * @returns {boolean} - True si es válido
 */
const validarEmail = (email) => {
    return emailRegex.test(email);
};

/**
 * Valida que el nombre no esté vacío
 * @param {string} nombre - Nombre a validar
 * @returns {boolean} - True si es válido
 */
const validarNombre = (nombre) => {
    return typeof nombre === 'string' && nombre.trim().length > 0;
};

module.exports = {
    validarPassword,
    validarEmail,
    validarNombre,
    passRegex,
    emailRegex
};
