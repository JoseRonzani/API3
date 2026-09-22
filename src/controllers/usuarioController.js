const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const usuarioModel = require('../models/usuarioModel');
const { validarPassword, validarEmail, validarNombre } = require('../utils/validadores');

const registrar = async (req, res) => {
    try {

        const {nombre, email, password } = req.body;

        // Validar que todos los campos existan
        if (!nombre || !email || !password) {
            return res.status(400).json({
                error: 'Nombre, email y contraseña son requeridos'
            });
        }

        // Validar nombre
        if (!validarNombre(nombre)) {
            return res.status(400).json({
                error: 'El nombre debe ser un texto no vacío'
            });
        }

        // Validar email
        if (!validarEmail(email)) {
            return res.status(400).json({
                error: 'El email debe tener un formato válido'
            });
        }

        // Validar contraseña (RegEx)
        if (!validarPassword(password)) {
            return res.status(400).json({
                error: 'La contraseña es demasiado débil. Debe contener mínimo 8 caracteres, al menos 1 mayúscula y 1 número'
            });
        }

        const saltRounds = 10;

        const passwordHasheada = await bcrypt.hash(password, saltRounds);

        await usuarioModel.crearUsuario(nombre, email, passwordHasheada);

        res.status(201).json({
            mensaje: 'Usuario registrado.'
        });

    } catch (error) {

        console.error('[ERROR]:', error);
        res.status(500).json({
            error: 'Error en servidor.'
        });
    }
};

const login = async (req, res) => {
    try {
        const {email, password} = req.body;

        // Validar que ambos campos existan
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email y contraseña son requeridos'
            });
        }
        
        const usuario = await usuarioModel.obtenerPorEmail(email);

        if(!usuario) {
            return res.status(401).json({
                error: 'Credenciales inválidas.'
            });
        }
        const passValida = await bcrypt.compare(
            password,
            usuario.password
        );

        if(!passValida) {
            return res.status(401).json({
                error: 'Credenciales inválidas.'
            });
        }
    const payload = {
        id: usuario.id
    };
    
    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
    );

    res.status(200).json({ token });
}  catch (error) {
    console.error('[ERROR]:', error);
    res.status(500).json({
        error: 'Error en servidor.'
    });
}
}

const obtenerPerfil = async (req, res) => {
    try {
        // req.usuario contiene los datos del token (id)
        const usuarioId = req.usuario.id;

        const usuario = await usuarioModel.obtenerPorId(usuarioId);

        if (!usuario) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        res.status(200).json(usuario);
    } catch (error) {
        console.error('[ERROR]:', error);
        res.status(500).json({
            error: 'Error en servidor.'
        });
    }
}

module.exports = {registrar, login, obtenerPerfil};