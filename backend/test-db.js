
//Importa la conexion a TiDB Cloud configurada en db.js
const conexion = require("./db");

//Define una funcion asincronica para comprobar la conexion a la base de datos
async function probarConexion() {
    try {
        //Ejecuta una consulta SQL para obtener todas las tablas de la base de datos
        const [filas] = await conexion.query("SHOW TABLES");

        //Muestra un mensaje cuando la conexion se realiza correctamente
        console.log("Conexion exitosa a TiDB Cloud");

        //Muestra las tablas encontradas en formato de tabla en la consola
        console.table(filas);
    } catch (error) {
        //Captura y muestra el error si falla la conexion o la consulta SQL
        console.error("Error de conexion:", error.message);
    } finally {
        //Cierra las conexiones del pool al finalizar la prueba
        await conexion.end();
    }
}

//Ejecuta la funcion para comprobar la conexion con TiDB Cloud
probarConexion();
