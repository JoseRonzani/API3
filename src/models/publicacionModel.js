const pool = require('../config/db');

/**
 * Crear una nueva publicación
 * @param {string} titulo - Título de la publicación
 * @param {string} contenido - Contenido de la publicación
 * @param {number} autor_id - ID del autor (usuario)
 * @returns {Promise} - Resultado de la inserción
 */
const crearPublicacion = async (titulo, contenido, autor_id) => {
    const query = 'INSERT INTO publicaciones (titulo, contenido, autor_id) VALUES (?, ?, ?)';
    const [resultado] = await pool.query(query, [titulo, contenido, autor_id]);
    return resultado;
};

/**
 * Obtener todas las publicaciones con paginación y búsqueda
 * @param {string} search - Término de búsqueda (opcional)
 * @param {number} limit - Cantidad de registros por página
 * @param {number} offset - Desplazamiento (página * limit)
 * @returns {Promise} - Array de publicaciones
 */
const obtenerTodas = async (search = '', limit = 10, offset = 0) => {
    let query = 'SELECT id, titulo, contenido, autor_id FROM publicaciones';
    const values = [];

    if (search) {
        query += ' WHERE titulo LIKE ?';
        values.push(`%${search}%`);
    }

    query += ' LIMIT ? OFFSET ?';
    values.push(parseInt(limit), parseInt(offset));

    const [resultado] = await pool.query(query, values);
    return resultado;
};

/**
 * Obtener una publicación por ID
 * @param {number} id - ID de la publicación
 * @returns {Promise} - Datos de la publicación
 */
const obtenerPorId = async (id) => {
    const query = 'SELECT id, titulo, contenido, autor_id FROM publicaciones WHERE id = ?';
    const [resultado] = await pool.query(query, [id]);
    return resultado[0];
};

/**
 * Obtener todas las publicaciones de un autor
 * @param {number} autor_id - ID del autor
 * @param {number} limit - Cantidad de registros por página
 * @param {number} offset - Desplazamiento
 * @returns {Promise} - Array de publicaciones del autor
 */
const obtenerPorAutor = async (autor_id, limit = 10, offset = 0) => {
    const query = 'SELECT id, titulo, contenido, autor_id FROM publicaciones WHERE autor_id = ? LIMIT ? OFFSET ?';
    const [resultado] = await pool.query(query, [autor_id, parseInt(limit), parseInt(offset)]);
    return resultado;
};

/**
 * Actualizar una publicación
 * @param {number} id - ID de la publicación
 * @param {string} titulo - Nuevo título
 * @param {string} contenido - Nuevo contenido
 * @returns {Promise} - Resultado de la actualización
 */
const actualizar = async (id, titulo, contenido) => {
    const query = 'UPDATE publicaciones SET titulo = ?, contenido = ? WHERE id = ?';
    const [resultado] = await pool.query(query, [titulo, contenido, id]);
    return resultado;
};

/**
 * Eliminar una publicación
 * @param {number} id - ID de la publicación
 * @returns {Promise} - Resultado de la eliminación
 */
const eliminar = async (id) => {
    const query = 'DELETE FROM publicaciones WHERE id = ?';
    const [resultado] = await pool.query(query, [id]);
    return resultado;
};

module.exports = {
    crearPublicacion,
    obtenerTodas,
    obtenerPorId,
    obtenerPorAutor,
    actualizar,
    eliminar
};
