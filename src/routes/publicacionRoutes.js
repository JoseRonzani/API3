const express = require('express');
const router = express.Router();
const publicacionController = require('../controllers/publicacionController');
const { autenticar } = require('../middlewares/autenticacion');

// Crear una nueva publicación (requiere autenticación)
router.post('/', autenticar, publicacionController.crear);

// Obtener todas las publicaciones con paginación y búsqueda (sin autenticación)
router.get('/', publicacionController.obtenerTodas);

// Obtener una publicación por ID (sin autenticación)
router.get('/:id', publicacionController.obtenerPorId);

// Actualizar una publicación (requiere autenticación)
router.put('/:id', autenticar, publicacionController.actualizar);

// Eliminar una publicación (requiere autenticación)
router.delete('/:id', autenticar, publicacionController.eliminar);

module.exports = router;
