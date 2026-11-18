const mysql = require("mysql2/promise");
const fs = require("fs");

//Carga las variables del archivo .env
require("dotenv").config();

//Obtiene el certificado SSL desde una variable o archivo local
const certificado = process.env.DB_SSL_CA_BASE64
    ? Buffer.from(process.env.DB_SSL_CA_BASE64, "base64").toString("utf8")
    : fs.readFileSync(process.env.DB_SSL_CA, "utf8");

//Configura las conexiones a TiDB Cloud
const conexion = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    //Configura la conexion segura mediante SSL
    ssl: {
        ca: certificado,
        rejectUnauthorized: true
    },

    //Permite esperar conexiones disponibles
    waitForConnections: true,

    //Establece un maximo de 10 conexiones simultaneas
    connectionLimit: 10
});

//Permite utilizar la conexion en otros archivos
module.exports = conexion;
