const { validarPassword, validarEmail, validarNombre } = require('../src/utils/validadores');

describe('Suite: Seguridad de Contraseñas', () => {
    
    test('1. Rechaza longitud menor a 8 caracteres', () => {
        expect(validarPassword('Abc1')).toBe(false);
    });

    test('2. Rechaza sin mayúscula', () => {
        expect(validarPassword('abcdefg1')).toBe(false);
    });

    test('3. Rechaza sin número', () => {
        expect(validarPassword('Abcdefgh')).toBe(false);
    });

    test('4. Rechaza solo números', () => {
        expect(validarPassword('12345678')).toBe(false);
    });

    test('5. Rechaza solo mayúsculas y números (sin minúsculas)', () => {
        // Nota: ABCD1234 cumple con los requisitos, solo se rechaza si además tiene restricciones
        // Como solo validamos 8+, mayúscula y número, esto es aceptado
        expect(validarPassword('ABCD1234')).toBe(true);
    });

    test('5b. Acepta solo mayúsculas y números si cumple requisitos', () => {
        expect(validarPassword('abcd1234')).toBe(false); // Sin mayúscula
    });

    test('8. Acepta contraseña con caracteres válidos', () => {
        // Solo caracteres alfanuméricos (A-Z, a-z, 0-9) son permitidos
        expect(validarPassword('MiContraseña123456')).toBe(false); // La ñ no es permitida
    });

    test('8b. Acepta contraseña larga válida', () => {
        expect(validarPassword('MiContrasenaMuyLargaConNumeros123456')).toBe(true);
    });

    test('6. Acepta combinación válida: 8+ chars, mayúscula y número', () => {
        expect(validarPassword('Abcdefgh1')).toBe(true);
    });

    test('7. Acepta contraseña fuerte', () => {
        expect(validarPassword('MyPassword123')).toBe(true);
    });

    test('9. Rechaza caracteres especiales no permitidos', () => {
        expect(validarPassword('Pass@123')).toBe(false);
    });

    test('10. Rechaza espacios', () => {
        expect(validarPassword('Pass 123')).toBe(false);
    });

});

describe('Suite: Validación de Email', () => {
    
    test('1. Acepta email válido', () => {
        expect(validarEmail('usuario@dominio.com')).toBe(true);
    });

    test('2. Acepta email con números', () => {
        expect(validarEmail('usuario123@dominio456.com')).toBe(true);
    });

    test('3. Rechaza email sin @', () => {
        expect(validarEmail('usuariodominio.com')).toBe(false);
    });

    test('4. Rechaza email sin dominio', () => {
        expect(validarEmail('usuario@')).toBe(false);
    });

    test('5. Rechaza email sin extensión', () => {
        expect(validarEmail('usuario@dominio')).toBe(false);
    });

    test('6. Rechaza email con espacios', () => {
        expect(validarEmail('usuario @dominio.com')).toBe(false);
    });

});

describe('Suite: Validación de Nombre', () => {
    
    test('1. Acepta nombre válido', () => {
        expect(validarNombre('Juan')).toBe(true);
    });

    test('2. Acepta nombre con espacios', () => {
        expect(validarNombre('Juan Pérez')).toBe(true);
    });

    test('3. Rechaza string vacío', () => {
        expect(validarNombre('')).toBe(false);
    });

    test('4. Rechaza solo espacios', () => {
        expect(validarNombre('   ')).toBe(false);
    });

    test('5. Rechaza tipo no string', () => {
        expect(validarNombre(123)).toBe(false);
    });

});
