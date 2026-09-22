const publicacionModel = require('../models/publicacionModel');

/**
 * Crear una nueva publicación
 * El autor_id se inyecta desde el JWT, no del body
 */
const crear = async (req, res) => {
    try {
        const { titulo, contenido } = req.body;
        const autor_id = req.usuario.id; // Se extrae del JWT decodificado

        // Validar que el título y contenido existan
        if (!titulo || !contenido) {
            return res.status(400).json({
                error: 'El título y contenido son requeridos'
            });
        }

        if (typeof titulo !== 'string' || titulo.trim().length === 0) {
            return res.status(400).json({
                error: 'El título debe ser un texto no vacío'
            });
        }

        if (typeof contenido !== 'string' || contenido.trim().length === 0) {
            return res.status(400).json({
                error: 'El contenido debe ser un texto no vacío'
            });
        }

        await publicacionModel.crearPublicacion(titulo, contenido, autor_id);

        res.status(201).json({
            mensaje: 'Publicación creada exitosamente',
            autor_id
        });

    } catch (error) {
        console.error('[ERROR]:', error);
        res.status(500).json({
            error: 'Error en servidor'
        });
    }
};

/**
 * Obtener todas las publicaciones con paginación y búsqueda
 */
const obtenerTodas = async (req, res) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;

        // Validar que page y limit sean números válidos
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10)); // Max 100 items

        // Calcular OFFSET matemáticamente
        const offset = (pageNum - 1) * limitNum;

        const publicaciones = await publicacionModel.obtenerTodas(search, limitNum, offset);

        res.status(200).json({
            page: pageNum,
            limit: limitNum,
            datos: publicaciones
        });

    } catch (error) {
        console.error('[ERROR]:', error);
        res.status(500).json({
            error: 'Error en servidor'
        });
    }
};

/**
 * Obtener una publicación por ID
 */
const obtenerPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const publicacion = await publicacionModel.obtenerPorId(id);

        if (!publicacion) {
            return res.status(404).json({
                error: 'Publicación no encontrada'
            });
        }

        res.status(200).json(publicacion);

    } catch (error) {
        console.error('[ERROR]:', error);
        res.status(500).json({
            error: 'Error en servidor'
        });
    }
};

/**
 * Actualizar una publicación (solo el propietario)
 */
const actualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, contenido } = req.body;
        const usuario_id = req.usuario.id;

        // Validar que el título y contenido existan
        if (!titulo || !contenido) {
            return res.status(400).json({
                error: 'El título y contenido son requeridos'
            });
        }

        // Obtener la publicación
        const publicacion = await publicacionModel.obtenerPorId(id);

        if (!publicacion) {
            return res.status(404).json({
                error: 'Publicación no encontrada'
            });
        }

        // Verificar propiedad: solo el autor puede modificar
        if (publicacion.autor_id !== usuario_id) {
            return res.status(403).json({
                error: 'Forbidden: No eres el dueño'
            });
        }

        await publicacionModel.actualizar(id, titulo, contenido);

        res.status(200).json({
            mensaje: 'Publicación actualizada exitosamente'
        });

    } catch (error) {
        console.error('[ERROR]:', error);
        res.status(500).json({
            error: 'Error en servidor'
        });
    }
};

/**
 * Eliminar una publicación (solo el propietario)
 */
const eliminar = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = req.usuario.id;

        // Obtener la publicación
        const publicacion = await publicacionModel.obtenerPorId(id);

        if (!publicacion) {
            return res.status(404).json({
                error: 'Publicación no encontrada'
            });
        }

        // Verificar propiedad: solo el autor puede eliminar
        if (publicacion.autor_id !== usuario_id) {
            return res.status(403).json({
                error: 'Forbidden: No eres el dueño'
            });
        }

        await publicacionModel.eliminar(id);

        res.status(200).json({
            mensaje: 'Publicación eliminada exitosamente'
        });

    } catch (error) {
        console.error('[ERROR]:', error);
        res.status(500).json({
            error: 'Error en servidor'
        });
    }
};

module.exports = {
    crear,
    obtenerTodas,
    obtenerPorId,
    actualizar,
    eliminar
};
