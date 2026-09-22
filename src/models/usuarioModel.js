const pool = require('../config/db');

const crearUsuario = async (nombre, email, passwordHasheada) => {
    const query = 'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)';

    const [resultado] = await pool.query(query, [nombre, email, passwordHasheada]);

    return resultado;
};

const obtenerPorEmail = async (email) => {
    const query = 'SELECT * FROM usuarios WHERE email = ?';
    const [resultado] = await pool.query(query, [email]);
    return resultado[0];
}

const obtenerPorId = async (id) => {
const query = 'SELECT nombre AS usuario, rol AS roles FROM usuarios WHERE id = ?';
    const [resultado] = await pool.query(query, [id]);
    return resultado[0];
}

module.exports = { crearUsuario, obtenerPorEmail, obtenerPorId };