const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { autenticar } = require('../middlewares/autenticacion');

router.post('/registro', usuarioController.registrar);
router.post('/login', usuarioController.login);
router.get('/perfil', autenticar, usuarioController.obtenerPerfil);

module.exports = router;