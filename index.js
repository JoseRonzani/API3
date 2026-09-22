require ('dotenv').config();

const express = require ('express');
const cors = require ('cors');

// Ejecuta el test de conexión

require('./src/config/db');

const app = express ();
app.use(cors());
app.use(express.json());
app.use(
    '/api/usuarios',
    require('./src/routes/usuarioRoutes')
);
app.use(
    '/api/publicaciones',
    require('./src/routes/publicacionRoutes')
);

const PORT = process.env.PORT || 3000;

app.listen (PORT, () => {
    console.log(`Servidor en puerto ${PORT}`
        );
});