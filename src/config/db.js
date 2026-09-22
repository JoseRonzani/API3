const mysql = require ('mysql2/promise');
require ('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

pool.query('SELECT 1 + 1 AS solucion')
    .then(([rows]) => {
        console.log('DB Conectada. Test query:'
            , rows[0].solucion);
    })
    .catch (err => {
        console.error('Error al conectar a DB:'
            , err);
    });

module.exports = pool;