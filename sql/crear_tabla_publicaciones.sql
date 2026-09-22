-- Tabla de Publicaciones con integridad referencial
-- Ejecutar este SQL en tu base de datos MySQL

CREATE TABLE publicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    contenido TEXT NOT NULL,
    autor_id INT NOT NULL,
    
    -- Clave Foránea: integridad referencial
    FOREIGN KEY (autor_id) REFERENCES usuarios(id)
    ON DELETE RESTRICT
);

-- Explicación de ON DELETE RESTRICT:
-- - Previene que un usuario sea eliminado si tiene publicaciones activas
-- - Protege la integridad de los datos

-- Índice para mejorar búsquedas y paginación
CREATE INDEX idx_autor_id ON publicaciones(autor_id);
CREATE INDEX idx_titulo ON publicaciones(titulo);
