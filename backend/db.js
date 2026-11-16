
//Importa mysql2 con soporte para promesas y operaciones asincronicas
const mysql = require("mysql2/promise");

//Importa el modulo fs para leer archivos del sistema
const fs = require("fs");

//Carga las variables de entorno almacenadas en el archivo .env
require("dotenv").config();

//Crea un conjunto de conexiones para comunicarse con TiDB Cloud
const conexion = mysql.createPool({
    //Obtiene la direccion del servidor desde el archivo .env
    host: process.env.DB_HOST,

    //Obtiene el puerto de conexion y lo convierte a numero
    port: Number(process.env.DB_PORT),

    //Obtiene el nombre de usuario utilizado para conectarse a TiDB
    user: process.env.DB_USER,

    //Obtiene la contraseña de la base de datos desde el archivo .env
    password: process.env.DB_PASSWORD,

    //Indica el nombre de la base de datos que utilizara la aplicacion
    database: process.env.DB_NAME,

    //Configura una conexion segura mediante el protocolo SSL
    ssl: {
        //Lee el certificado de seguridad desde la ruta indicada en .env
        ca: fs.readFileSync(process.env.DB_SSL_CA),

        //Comprueba que el certificado del servidor sea valido
        rejectUnauthorized: true
    },

    //Permite esperar cuando todas las conexiones estan ocupadas
    waitForConnections: true,

    //Establece un maximo de 10 conexiones simultaneas en el pool
    connectionLimit: 10
});

//Exporta el pool de conexiones para utilizarlo en otros archivos
module.exports = conexion;
