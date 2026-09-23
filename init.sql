-- Archivo: init.sql
-- Docker ejecuta este script automáticamente la primera vez que
-- se crea el volumen del contenedor de MySQL (ver docker-compose.yml)

CREATE DATABASE IF NOT EXISTS sistema_web_db;
USE sistema_web_db;

-- ============================================
-- TABLA: usuarios
-- ============================================
-- Incluye la columna "rol" porque usuarioModel.obtenerPorId()
-- hace SELECT ... rol AS roles FROM usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'usuario'
);

-- ============================================
-- TABLA: publicaciones
-- ============================================
CREATE TABLE IF NOT EXISTS publicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    contenido TEXT NOT NULL,
    autor_id INT NOT NULL,

    -- Integridad referencial: no se puede borrar un usuario
    -- que todavía tenga publicaciones
    FOREIGN KEY (autor_id) REFERENCES usuarios(id)
        ON DELETE RESTRICT
);

-- Índices para optimizar búsquedas (LIKE) y JOINs por autor
CREATE INDEX idx_titulo ON publicaciones(titulo);
CREATE INDEX idx_autor_id ON publicaciones(autor_id);

-- ============================================
-- DATOS DE EJEMPLO
-- ============================================
-- ⚠️ Sobre las contraseñas:
-- Tu API guarda las contraseñas hasheadas con bcrypt (10 salt rounds),
-- y bcrypt genera un salt distinto cada vez que se corre, incluso para
-- el mismo texto plano. Por eso NO es posible "adivinar" desde SQL puro
-- un hash que haga login válido con una contraseña que vos elijas.
--
-- Para probar el login real de punta a punta:
--   1) docker-compose up -d
--   2) POST http://localhost:3000/api/usuarios/registro
--      { "nombre": "Admin Demo", "email": "nuevo@demo.com", "password": "Password123" }
--   3) POST http://localhost:3000/api/usuarios/login con esas mismas credenciales
--
-- Aun así, dejamos usuarios "semilla" insertados por SQL para que la tabla
-- no esté vacía apenas levantás el contenedor (podés ver GET /api/perfil
-- con un token que generes vos, listar publicaciones, probar paginación,
-- búsqueda, el 403 de propiedad, etc.). El hash de abajo tiene formato
-- bcrypt válido, pero no corresponde a ninguna contraseña en texto plano
-- conocida, así que no sirve para hacer login por sí solo:
INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Admin Demo', 'admin@demo.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'admin'),
('Usuario Demo', 'usuario@demo.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'usuario');

-- Publicaciones de ejemplo (para probar GET /api/publicaciones,
-- paginación ?page=&limit=, búsqueda ?search=, y el 403 al
-- intentar modificar/eliminar publicaciones de otro autor)
INSERT INTO publicaciones (titulo, contenido, autor_id) VALUES
('Bienvenida al sistema', 'Contenido de ejemplo generado por init.sql para probar los endpoints de publicaciones sin crear datos a mano.', 1),
('Segunda publicación de prueba', 'Otra publicación de ejemplo, útil para probar paginación (?page=&limit=) y búsqueda dinámica (?search=).', 1),
('Notas del usuario demo', 'Publicación asociada al segundo usuario semilla, ideal para probar la verificación de propiedad (403) en PUT/DELETE.', 2);
