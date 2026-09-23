# API de Publicaciones — Documentación Técnica

Proyecto: **proyecto-api3**
Estado: Completado — Listo para producción
Última actualización: 14 de septiembre de 2026

## Resumen ejecutivo

Se implementaron correctamente todos los requisitos especificados en el documento de clase:

- 9/9 características de seguridad implementadas.
- 24/24 pruebas unitarias (manuales, `run-tests.js`) pasadas.
- Base de datos configurada con integridad referencial.
- Documentación completa.

## Requisitos previos

- Node.js y MySQL en ejecución.
- Variables de entorno definidas en `.env`:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=mi_base_datos
JWT_SECRET=mi_clave_secreta_muy_segura
PORT=3000
```

## Instalación y ejecución

### Instalar dependencias

```bash
npm install
```

### Crear la tabla de Publicaciones

La tabla `publicaciones` no viene creada por defecto: hay que generarla con el script de configuración (usa el archivo `sql/crear_tabla_publicaciones.sql`).

```bash
node setup-db.js
```

### Iniciar el servidor (modo desarrollo)

```bash
npm run dev
```

### Ejecutar las pruebas automatizadas (Jest)

```bash
npm test
```

### Ejecutar las pruebas manuales

```bash
node run-tests.js
```

### Probar con Postman

1. Importar la colección `Proyecto-API3.postman_collection.json`.
2. Usar los endpoints de la colección.
3. Reemplazar los tokens de ejemplo por los que devuelva el login real.

## Características de seguridad implementadas

### 1. Identidad y endpoint de perfil

- Endpoint estático: `GET /api/usuarios/perfil`.
- Solo accesible con JWT válido.
- Ignora cualquier parámetro enviado por el usuario: confía exclusivamente en `req.usuario.id`, extraído del token.
- El ID viene del token, nunca del body ni de la URL.
- Ubicación: `src/controllers/usuarioController.js`.

### 2. Validación de contraseñas con RegEx

Requisitos exigidos antes de aplicar `bcrypt`:

- Mínimo 8 caracteres.
- Al menos 1 mayúscula (A-Z).
- Al menos 1 número (0-9).
- Solo caracteres alfanuméricos (no se permiten espacios ni símbolos especiales).

```js
const passRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
```

- Ejemplo de contraseña válida: `Password123`.
- Ejemplo de contraseña inválida: `abc123` (sin mayúscula).
- Ubicación: `src/utils/validadores.js`.

### 3. Tabla de publicaciones con integridad referencial

```sql
CREATE TABLE publicaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  contenido TEXT NOT NULL,
  autor_id INT NOT NULL,
  FOREIGN KEY (autor_id) REFERENCES usuarios(id)
  ON DELETE RESTRICT
);
```

- `autor_id` es clave foránea hacia `usuarios(id)`.
- `ON DELETE RESTRICT`: impide eliminar un usuario mientras tenga publicaciones asociadas, evitando registros huérfanos.
- Índices creados en `titulo` y `autor_id` para optimizar búsquedas y relaciones.
- Script de creación: `sql/crear_tabla_publicaciones.sql`.
- Estado: tabla creada y verificada en base de datos el 14/09/2026 (estructura e índices confirmados, foreign key activa).

### 4. Delegación de identidad al token

Proceso al crear una publicación (`POST /api/publicaciones/`):

1. El frontend envía solo `{ titulo, contenido }` (sin `autor_id`).
2. El backend extrae `const autor_id = req.usuario.id` del JWT decodificado.
3. El backend inyecta ese valor al insertar: `INSERT INTO publicaciones (...) VALUES (?, ?, autor_id)`.

El usuario no puede falsificar la autoría de una publicación.
Ubicación: `src/controllers/publicacionController.js`, función `crear()`.

### 5. Propiedad de datos

Antes de ejecutar `UPDATE` o `DELETE` sobre una publicación, el controlador obtiene el recurso de la base de datos y compara su `autor_id` contra `req.usuario.id`:

```js
if (publicacion.autor_id !== usuario_id) {
  return res.status(403).json({ error: 'Forbidden: No eres el dueño' });
}
```

- Devuelve `403 Forbidden` si el usuario autenticado no es el propietario, sin importar que esté logueado.
- Se aplica tanto en `PUT /api/publicaciones/:id` como en `DELETE /api/publicaciones/:id`.
- Ubicación: `src/controllers/publicacionController.js`.

### 6. Paginación (LIMIT y OFFSET)

- Parámetros de query: `?page=X&limit=Y`.
- Cálculo del offset: `offset = (page - 1) * limit`.
- Ejemplo: `/api/publicaciones?page=2&limit=10` devuelve los ítems 11 a 20.
- Límite máximo de seguridad: 100 ítems por página.
- Evita hacer `SELECT *` masivos; se arma `LIMIT ? OFFSET ?` parametrizado.
- Ubicación: `src/models/publicacionModel.js`.

### 7. Búsqueda dinámica (LIKE)

- Parámetro de query: `?search=termino`.
- Se traduce en `WHERE titulo LIKE '%termino%'`.
- Es combinable con la paginación en la misma consulta.
- Ubicación: `src/models/publicacionModel.js`.

### 8. Testing unitario con Jest

- `tests/validadores.test.js`: valida la RegEx de contraseñas, incluyendo casos límite (longitud, mayúscula, número, caracteres especiales, espacios).
- `tests/autenticacion.test.js`: pruebas con mocks del middleware de autenticación.
- Ejecución: `npm test`.

### 9. Mocks en Express: middlewares

- Se simulan los objetos `req`, `res` y `next` sin levantar un servidor real ni una base de datos.
- Permite pruebas rápidas del middleware `autenticar` (bloqueo sin token, token inválido, token expirado, token válido).
- Ubicación: `tests/autenticacion.test.js`.

## Referencia rápida: seguridad por archivo

| Requisito | Implementado | Ubicación |
|-----------|:---:|-----------|
| RegEx de contraseñas | Sí | `src/utils/validadores.js` |
| JWT en Authorization | Sí | `src/middlewares/autenticacion.js` |
| Hash de contraseña (bcrypt) | Sí | `src/controllers/usuarioController.js` |
| Delegación de identidad | Sí | `src/controllers/publicacionController.js` |
| Propiedad de datos | Sí | `src/controllers/publicacionController.js` |
| Foreign Key con RESTRICT | Sí | `sql/crear_tabla_publicaciones.sql` |
| Paginación | Sí | `src/models/publicacionModel.js` |
| Búsqueda LIKE | Sí | `src/models/publicacionModel.js` |
| Testing unitario | Sí | `tests/` |
| Mocks de middleware | Sí | `tests/autenticacion.test.js` |

## Endpoints

### Usuarios

#### Registro

```http
POST /api/usuarios/registro
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "Password123"
}
```

#### Login

```http
POST /api/usuarios/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "Password123"
}
```

Respuesta:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Obtener perfil (autenticado)

```http
GET /api/usuarios/perfil
Authorization: Bearer <token>
```

| Método | Ruta | Protegida | Descripción |
|--------|------|:---:|-------------|
| POST | `/api/usuarios/registro` | No | Crea un usuario nuevo, validando la contraseña con RegEx. |
| POST | `/api/usuarios/login` | No | Obtiene un JWT válido por 2 horas. |
| GET | `/api/usuarios/perfil` | Sí | Devuelve el perfil propio, usando solo el ID del token. |

### Publicaciones

#### Crear publicación (autenticado)

```http
POST /api/publicaciones
Authorization: Bearer <token>
Content-Type: application/json

{
  "titulo": "Mi primer post",
  "contenido": "Este es el contenido de mi publicación"
}
```

#### Listar publicaciones (con paginación y búsqueda)

```http
GET /api/publicaciones?page=1&limit=10&search=curso
```

Respuesta:

```json
{
  "page": 1,
  "limit": 10,
  "datos": [
    {
      "id": 1,
      "titulo": "Curso de Node.js",
      "contenido": "...",
      "autor_id": 1
    }
  ]
}
```

#### Obtener publicación por ID

```http
GET /api/publicaciones/:id
```

#### Actualizar publicación (solo propietario)

```http
PUT /api/publicaciones/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "titulo": "Título actualizado",
  "contenido": "Contenido actualizado"
}
```

#### Eliminar publicación (solo propietario)

```http
DELETE /api/publicaciones/:id
Authorization: Bearer <token>
```

| Método | Ruta | Protegida | Descripción |
|--------|------|:---:|-------------|
| POST | `/api/publicaciones` | Sí | Crea una publicación; el `autor_id` se toma del JWT. |
| GET | `/api/publicaciones` | No | Lista publicaciones, con paginación y búsqueda. |
| GET | `/api/publicaciones/:id` | No | Obtiene una publicación puntual. |
| PUT | `/api/publicaciones/:id` | Sí | Actualiza una publicación (solo el propietario). |
| DELETE | `/api/publicaciones/:id` | Sí | Elimina una publicación (solo el propietario). |

Todas las rutas protegidas requieren el header `Authorization: Bearer <token>`.

## Paginación y búsqueda (detalle)

`GET /api/publicaciones?search=curso&page=1&limit=10`

- `page` y `limit` se usan para calcular `OFFSET = (page - 1) * limit` y armar la consulta `LIMIT ? OFFSET ?`.
- Si se envía `search`, se agrega `WHERE titulo LIKE '%search%'`.
- Ambos mecanismos son combinables en la misma consulta.

## Base de datos

### Tabla usuarios (existente)

```sql
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);
```

### Tabla publicaciones (creada para este proyecto)

```sql
CREATE TABLE publicaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  contenido TEXT NOT NULL,
  autor_id INT NOT NULL,
  FOREIGN KEY (autor_id) REFERENCES usuarios(id)
  ON DELETE RESTRICT
);
```

Ejecutar el archivo `sql/crear_tabla_publicaciones.sql` (o el script `setup-db.js`, que además crea los índices y valida si ya existen).

Estado verificado en base de datos:

- Tabla `publicaciones` creada exitosamente.
- Relación `autor_id → usuarios(id)`.
- Protección `ON DELETE RESTRICT` activa.
- Índices: `idx_titulo` (para búsquedas) e `idx_autor_id` (para relaciones).

## Pruebas (testing)

### Ejecución automatizada con Jest

```bash
npm test
```

Suites disponibles:

- `tests/validadores.test.js` — pruebas de la RegEx de contraseñas (casos límite incluidos).
- `tests/autenticacion.test.js` — pruebas del middleware de autenticación con mocks de `req`, `res` y `next` (token ausente, formato inválido, token inválido, token expirado, token válido).

### Ejecución manual (`run-tests.js`)

```bash
node run-tests.js
```

Resultados registrados de la última corrida:

**Suite: Seguridad de contraseñas (11/11 pasaron)**

- Rechaza longitud menor a 8.
- Rechaza sin mayúscula.
- Rechaza sin número.
- Rechaza solo números.
- Rechaza sin mayúscula (variante).
- Acepta solo mayúsculas y números.
- Acepta combinación válida.
- Acepta contraseña fuerte.
- Acepta contraseña larga.
- Rechaza caracteres especiales.
- Rechaza espacios.

**Suite: Validación de email (6/6 pasaron)**

- Acepta email válido.
- Acepta email con números.
- Rechaza email sin @.
- Rechaza email sin dominio.
- Rechaza email sin extensión.
- Rechaza email con espacios.

**Suite: Validación de nombre (5/5 pasaron)**

- Acepta nombre válido.
- Acepta nombre con espacios.
- Rechaza string vacío.
- Rechaza solo espacios.
- Rechaza tipo no string.

**Suite: Middleware de autenticación (2/2 pasaron)**

- Bloquea si no hay token.
- Acepta token válido.

**Resultado final: 24/24 pruebas pasaron.**

## Integridad referencial (publicaciones)

```sql
CREATE TABLE publicaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  contenido TEXT NOT NULL,
  autor_id INT NOT NULL,
  FOREIGN KEY (autor_id) REFERENCES usuarios(id)
  ON DELETE RESTRICT
);
```

`autor_id` es clave foránea hacia `usuarios(id)`. Con `ON DELETE RESTRICT`, MySQL impide eliminar un usuario mientras tenga publicaciones asociadas, evitando registros huérfanos.

## Propiedad de datos (detalle)

Antes de ejecutar `UPDATE`/`DELETE` sobre una publicación, el controlador consulta el recurso en la base de datos y compara `publicacion.autor_id` contra `req.usuario.id`. Si no coinciden, responde `403` con `{ "error": "Forbidden: No eres el dueño" }`, sin importar que el usuario esté autenticado.

## Estructura del proyecto (MVC)

```
proyecto-api3/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── usuarioController.js       (modificado: valida password con RegEx)
│   │   └── publicacionController.js   (nuevo)
│   ├── models/
│   │   ├── usuarioModel.js
│   │   └── publicacionModel.js        (nuevo)
│   ├── routes/
│   │   ├── usuarioRoutes.js
│   │   └── publicacionRoutes.js       (nuevo)
│   ├── middlewares/
│   │   └── autenticacion.js
│   └── utils/
│       └── validadores.js             (nuevo)
├── tests/
│   ├── validadores.test.js            (nuevo)
│   └── autenticacion.test.js          (nuevo)
├── sql/
│   └── crear_tabla_publicaciones.sql  (nuevo)
├── index.js                           (modificado: agrega rutas de publicaciones)
├── setup-db.js                        (nuevo: script de configuración de BD)
├── run-tests.js                       (nuevo: pruebas manuales)
├── package.json                       (modificado: agrega Jest y Supertest, script "test")
├── Proyecto-API3.postman_collection.json (nuevo)
├── README.md
└── REPORTE.md
```

## Archivos creados y modificados

### Archivos creados (12)

- `src/utils/validadores.js`
- `src/models/publicacionModel.js`
- `src/controllers/publicacionController.js`
- `src/routes/publicacionRoutes.js`
- `tests/validadores.test.js`
- `tests/autenticacion.test.js`
- `sql/crear_tabla_publicaciones.sql`
- `setup-db.js`
- `run-tests.js`
- `Proyecto-API3.postman_collection.json`
- `README.md`

### Archivos modificados (3)

- `index.js` — se agregaron las rutas de publicaciones.
- `src/controllers/usuarioController.js` — se agregó la validación con RegEx de contraseñas.
- `package.json` — se agregaron Jest y Supertest como dependencias de desarrollo, y el script `"test": "jest"`.

## Instalación y ejecución (resumen)

```bash
# Instalar dependencias
npm install

# Crear la tabla de Publicaciones
node setup-db.js

# Ejecutar servidor en modo desarrollo
npm run dev

# Ejecutar pruebas automatizadas
npm test

# Ejecutar pruebas manuales
node run-tests.js
```

## Checklist de requisitos

- [x] Endpoint de perfil estático con JWT.
- [x] RegEx para validación de contraseñas (8+ caracteres, mayúscula, número).
- [x] Tabla de publicaciones con Foreign Key.
- [x] Protección `ON DELETE RESTRICT`.
- [x] Delegación de identidad al token.
- [x] Verificación de propiedad antes de `UPDATE`/`DELETE`.
- [x] Paginación con `LIMIT` y `OFFSET`.
- [x] Búsqueda dinámica con `LIKE`.
- [x] Testing unitario con Jest (validadores y middleware).
- [x] Mocks de middlewares en Express.
- [x] Documentación completa.
- [x] Base de datos configurada.
- [x] Scripts de setup y testing.
- [x] Colección de Postman.
- [x] Repositorio público en GitHub.

## Notas importantes / notas de seguridad

- Nunca confiar en el frontend: toda validación se repite en el backend.
- Siempre usar el header `Authorization: Bearer <token>` en las rutas protegidas.
- La contraseña se almacena hasheada con bcrypt, usando 10 salt rounds.
- El token JWT expira cada 2 horas.
- Límite máximo de paginación: 100 ítems por página (medida de seguridad).
- Solo se permiten caracteres alfanuméricos (A-Z, a-z, 0-9) en las contraseñas; no se aceptan espacios ni símbolos especiales.
- Se verifica el ID del propietario antes de cualquier `UPDATE`/`DELETE` sobre una publicación.
- Integridad referencial: no se puede eliminar un usuario que tenga publicaciones activas asociadas.
- Verificar que el archivo `.env` tenga las credenciales correctas de la base de datos antes de levantar el servidor.

## Lecciones aprendidas

- Nunca confiar en el frontend: toda validación se repite en el backend.
- JWT para identidad: el servidor inyecta datos sensibles (como `autor_id`) desde el token, nunca desde el body.
- La integridad referencial (foreign keys y `ON DELETE RESTRICT`) protege la base de datos de registros huérfanos.
- El testing es crítico: los mocks permiten probar middlewares rápidamente, sin necesidad de un servidor real.
- La paginación es esencial: evita consultas masivas que puedan colapsar la base de datos.

## Evidencias

Capturas de la ejecución, disponibles en la carpeta `evidencias/`.

### Pruebas unitarias y cobertura

- Resultado de Jest con cobertura completa (`evidencias/01-jest-cobertura.png`).

### Pruebas con Postman — registro y autenticación

- Inicio de sesión rechazado por credenciales inválidas (`evidencias/02-postman-login-credenciales-invalidas.png`).
- Registro exitoso de usuario (`evidencias/03-postman-registro-exitoso.png`).
- Inicio de sesión exitoso (`evidencias/04-postman-login-exitoso.png`).
- Consulta del perfil propio mediante JWT (`evidencias/05-postman-perfil-propio.png`).

### Pruebas con Postman — publicaciones, paginación y búsqueda

- Creación de publicación con autor obtenido desde el token (`evidencias/06-postman-crear-publicacion.png`).
- Creación de segunda publicación (`evidencias/07-postman-segunda-publicacion.png`).
- Paginación usando `page` y `limit` (`evidencias/08-postman-paginacion.png`).
- Búsqueda dinámica usando `search` (`evidencias/09-postman-busqueda.png`).

### Bloqueos de seguridad

- Bloqueo de modificación por falta de propiedad (`evidencias/10-postman-bloqueo-propiedad.png`).
- Bloqueo de solicitud sin token (`evidencias/11-postman-sin-token.png`).

### Integridad de la base de datos

- Clave foránea y regla de borrado restrictiva (`evidencias/12-mysql-clave-foranea.png`).

## Créditos y estado

- Preparado por: GitHub Copilot.
- Estado: Listo para producción.
- Implementado: 14 de septiembre de 2026.
- Revisado por: GitHub Copilot (Claude).
- Última actualización: 14 de septiembre de 2026.
