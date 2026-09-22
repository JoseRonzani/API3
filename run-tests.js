const { validarPassword, validarEmail, validarNombre } = require('./src/utils/validadores');
const jwt = require('jsonwebtoken');
const { autenticar } = require('./src/middlewares/autenticacion');

console.log('🧪 EJECUTANDO PRUEBAS MANUALES\n');

// ========== PRUEBAS DE CONTRASEÑA ==========
console.log('📋 Suite: Seguridad de Contraseñas');
console.log('─'.repeat(50));

const testesPassword = [
    { input: 'Abc1', expected: false, desc: 'Rechaza longitud menor a 8' },
    { input: 'abcdefg1', expected: false, desc: 'Rechaza sin mayúscula' },
    { input: 'Abcdefgh', expected: false, desc: 'Rechaza sin número' },
    { input: '12345678', expected: false, desc: 'Rechaza solo números' },
    { input: 'abcd1234', expected: false, desc: 'Rechaza sin mayúscula' },
    { input: 'ABCD1234', expected: true, desc: 'Acepta solo mayúsculas y números' },
    { input: 'Abcdefgh1', expected: true, desc: 'Acepta combinación válida' },
    { input: 'MyPassword123', expected: true, desc: 'Acepta contraseña fuerte' },
    { input: 'MiContrasenaMuyLargaConNumeros123456', expected: true, desc: 'Acepta contraseña larga' },
    { input: 'Pass@123', expected: false, desc: 'Rechaza caracteres especiales' },
    { input: 'Pass 123', expected: false, desc: 'Rechaza espacios' },
];

let passedPassword = 0;
testesPassword.forEach((test, i) => {
    const result = validarPassword(test.input);
    const status = result === test.expected ? '✓' : '✗';
    if (result === test.expected) passedPassword++;
    console.log(`${status} ${i + 1}. ${test.desc}`);
});
console.log(`Resultados: ${passedPassword}/${testesPassword.length} pasaron\n`);

// ========== PRUEBAS DE EMAIL ==========
console.log('📋 Suite: Validación de Email');
console.log('─'.repeat(50));

const testesEmail = [
    { input: 'usuario@dominio.com', expected: true, desc: 'Acepta email válido' },
    { input: 'usuario123@dominio456.com', expected: true, desc: 'Acepta email con números' },
    { input: 'usuariodominio.com', expected: false, desc: 'Rechaza email sin @' },
    { input: 'usuario@', expected: false, desc: 'Rechaza email sin dominio' },
    { input: 'usuario@dominio', expected: false, desc: 'Rechaza email sin extensión' },
    { input: 'usuario @dominio.com', expected: false, desc: 'Rechaza email con espacios' },
];

let passedEmail = 0;
testesEmail.forEach((test, i) => {
    const result = validarEmail(test.input);
    const status = result === test.expected ? '✓' : '✗';
    if (result === test.expected) passedEmail++;
    console.log(`${status} ${i + 1}. ${test.desc}`);
});
console.log(`Resultados: ${passedEmail}/${testesEmail.length} pasaron\n`);

// ========== PRUEBAS DE NOMBRE ==========
console.log('📋 Suite: Validación de Nombre');
console.log('─'.repeat(50));

const testesNombre = [
    { input: 'Juan', expected: true, desc: 'Acepta nombre válido' },
    { input: 'Juan Pérez', expected: true, desc: 'Acepta nombre con espacios' },
    { input: '', expected: false, desc: 'Rechaza string vacío' },
    { input: '   ', expected: false, desc: 'Rechaza solo espacios' },
    { input: 123, expected: false, desc: 'Rechaza tipo no string' },
];

let passedNombre = 0;
testesNombre.forEach((test, i) => {
    const result = validarNombre(test.input);
    const status = result === test.expected ? '✓' : '✗';
    if (result === test.expected) passedNombre++;
    console.log(`${status} ${i + 1}. ${test.desc}`);
});
console.log(`Resultados: ${passedNombre}/${testesNombre.length} pasaron\n`);

// ========== PRUEBAS DE MIDDLEWARE ==========
console.log('📋 Suite: Middleware de Autenticación');
console.log('─'.repeat(50));

process.env.JWT_SECRET = 'test-secret-key';

const runMiddlewareTest = (name, test) => {
    const req = { headers: test.headers || {} };
    let statusCode = null;
    const res = { 
        status: function(code) { statusCode = code; return this; },
        json: function(data) { return this; }
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };
    
    try {
        autenticar(req, res, next);
        const passed = test.shouldSucceed ? nextCalled : (statusCode === 401);
        console.log(`${passed ? '✓' : '✗'} ${name}`);
        return passed;
    } catch (e) {
        console.log(`✗ ${name} - Error: ${e.message}`);
        return false;
    }
};

let passedMiddleware = 0;
const testesMiddleware = [
    { name: 'Bloquea si no hay token', headers: {}, shouldSucceed: false },
    { name: 'Acepta token válido', headers: { authorization: `Bearer ${jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: '2h' })}` }, shouldSucceed: true },
];

testesMiddleware.forEach(test => {
    const result = runMiddlewareTest(test.name, test);
    if (result) passedMiddleware++;
});
console.log(`Resultados: ${passedMiddleware}/${testesMiddleware.length} pasaron\n`);

// ========== RESUMEN FINAL ==========
const totalTests = testesPassword.length + testesEmail.length + testesNombre.length + testesMiddleware.length;
const totalPassed = passedPassword + passedEmail + passedNombre + passedMiddleware;

console.log('═'.repeat(50));
console.log(`📊 RESULTADO FINAL: ${totalPassed}/${totalTests} pruebas pasaron`);
console.log('═'.repeat(50));

if (totalPassed === totalTests) {
    console.log('✅ ¡TODAS LAS PRUEBAS PASARON!');
    process.exit(0);
} else {
    console.log(`⚠️ ${totalTests - totalPassed} prueba(s) fallaron`);
    process.exit(1);
}
