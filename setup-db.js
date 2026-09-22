const mysql = require('mysql2/promise');
require('dotenv').config();

async function crearTabla() {
    let connection;
    try {
        // Conectar a la base de datos
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✓ Conectado a la base de datos');

        // SQL para crear tabla de publicaciones
        const sqlPublicaciones = `
            CREATE TABLE IF NOT EXISTS publicaciones (
                id INT AUTO_INCREMENT PRIMARY KEY,
                titulo VARCHAR(150) NOT NULL,
                contenido TEXT NOT NULL,
                autor_id INT NOT NULL,
                
                FOREIGN KEY (autor_id) REFERENCES usuarios(id)
                ON DELETE RESTRICT
            );
        `;

        // SQL para crear índices
        const sqlIndiceTitulo = `
            CREATE INDEX idx_titulo ON publicaciones(titulo);
        `;

        const sqlIndiceAutor = `
            CREATE INDEX idx_autor_id ON publicaciones(autor_id);
        `;

        // Ejecutar creación de tabla
        await connection.query(sqlPublicaciones);
        console.log('✓ Tabla "publicaciones" creada exitosamente');

        // Ejecutar índices (ignorar error si ya existen)
        try {
            await connection.query(sqlIndiceTitulo);
            console.log('✓ Índice en "titulo" creado');
        } catch (err) {
            if (err.code !== 'ER_DUP_KEYNAME') throw err;
            console.log('ℹ Índice en "titulo" ya existe');
        }

        try {
            await connection.query(sqlIndiceAutor);
            console.log('✓ Índice en "autor_id" creado');
        } catch (err) {
            if (err.code !== 'ER_DUP_KEYNAME') throw err;
            console.log('ℹ Índice en "autor_id" ya existe');
        }

        // Verificar estructura de la tabla
        const [tableInfo] = await connection.query(`DESCRIBE publicaciones`);
        console.log('\n📋 Estructura de la tabla:');
        console.table(tableInfo);

        console.log('\n✅ Base de datos configurada correctamente');
        console.log('   - Tabla: publicaciones');
        console.log('   - Relación: autor_id → usuarios(id)');
        console.log('   - Protección: ON DELETE RESTRICT');

    } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log('⚠️ La tabla "publicaciones" ya existe');
        } else if (error.code === 'ER_NO_SUCH_TABLE') {
            console.error('❌ Error: La tabla "usuarios" no existe. Créala primero');
        } else {
            console.error('❌ Error:', error.message);
        }
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Conexión cerrada');
        }
    }
}

crearTabla();
