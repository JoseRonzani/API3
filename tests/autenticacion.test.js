const jwt = require('jsonwebtoken');
const { autenticar } = require('../src/middlewares/autenticacion');

// Mock de las variables de entorno
process.env.JWT_SECRET = 'test-secret-key';

describe('Suite: Middleware de Autenticación', () => {

    let req, res, next;

    beforeEach(() => {
        // Mock de objetos req, res y next
        req = {
            headers: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        next = jest.fn();
    });

    test('1. Debe bloquear si no hay token', () => {
        req.headers.authorization = '';

        autenticar(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: expect.stringContaining('Formato inválido')
            })
        );
        expect(next).not.toHaveBeenCalled();
    });

    test('2. Debe bloquear si no hay header Authorization', () => {
        // Sin asignar authorization

        autenticar(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: expect.stringContaining('Formato inválido')
            })
        );
        expect(next).not.toHaveBeenCalled();
    });

    test('3. Debe bloquear si el formato no es "Bearer <token>"', () => {
        req.headers.authorization = 'Basic xyz123';

        autenticar(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    test('4. Debe bloquear si el token es inválido', () => {
        req.headers.authorization = 'Bearer token-invalido';

        autenticar(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: expect.stringContaining('Token inválido')
            })
        );
        expect(next).not.toHaveBeenCalled();
    });

    test('5. Debe permitir entrada con token válido', () => {
        const payload = { id: 1 };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });
        req.headers.authorization = `Bearer ${token}`;

        autenticar(req, res, next);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
        expect(req.usuario).toEqual(expect.objectContaining({ id: 1 }));
    });

    test('6. Debe extraer el ID del usuario del token', () => {
        const payload = { id: 42 };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });
        req.headers.authorization = `Bearer ${token}`;

        autenticar(req, res, next);

        expect(req.usuario.id).toBe(42);
    });

    test('7. Debe bloquear si el token está expirado', (done) => {
        // Crear un token con expiración inmediata
        const payload = { id: 1 };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '0s' });
        
        // Esperar un poco para que expire
        setTimeout(() => {
            req.headers.authorization = `Bearer ${token}`;

            autenticar(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
            done();
        }, 100);
    });

    test('8. Debe rechazar si falta el token en "Bearer"', () => {
        req.headers.authorization = 'Bearer ';

        autenticar(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

});
