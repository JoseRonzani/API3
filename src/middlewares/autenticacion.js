const jwt = require('jsonwebtoken');

const autenticar = (req, res, next) => {
    try {
        // Obtener el token del header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Formato inválido. Usa: Authorization: Bearer <token>'
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                error: 'Token no proporcionado'
            });
        }

        // Verificar y decodificar el token
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // Guardar los datos del usuario en la request
        req.usuario = payload;

        next();
    } catch (error) {
        console.error('[ERROR]:', error.message);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expirado'
            });
        }
        
        return res.status(401).json({
            error: 'Token inválido o expirado'
        });
    }
};

module.exports = { autenticar };
