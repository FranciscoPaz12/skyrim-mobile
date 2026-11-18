
const bcrypt = require("bcrypt");
const conexion = require("./db");

//Actualiza la contraseña del administrador en TiDB
async function crearUsuario() {
    try {
        //Datos del administrador
        const nombre = "Administrador";
        const usuario = "admin";
        const password = process.env.ADMIN_PASSWORD;

        //Valida que exista una contraseña de al menos 12 caracteres
        if (!password || password.length < 12) {
            throw new Error(
                "Configura ADMIN_PASSWORD con al menos 12 caracteres en .env"
            );
        }

        //Convierte la contraseña en un hash con bcrypt
        const passwordHash = await bcrypt.hash(password, 10);

        /*
        //Consulta original para crear un usuario
        const [resultado] = await conexion.execute(
            `INSERT INTO usuarios (Nombre, Usuario, PasswordHash)
             VALUES (?, ?, ?)`,
            [nombre, usuario, passwordHash]
        );
        */

        //Actualiza la contraseña del usuario admin
        const [resultado] = await conexion.execute(
            "UPDATE usuarios SET PasswordHash = ? WHERE Usuario = ?",
            [passwordHash, usuario]
        );

        //Comprueba si se modifico algun usuario
        if (resultado.affectedRows === 0) {
            throw new Error("No se encontro el usuario admin");
        }

        /*
        console.log("Usuario creado correctamente");
        console.log("ID:", resultado.insertId);
        console.log("Usuario:", usuario);
        */

        //Muestra el resultado de la actualizacion
        console.log("Contraseña actualizada correctamente");
        console.log("Usuario:", usuario);

    } catch (error) {
        //Controla los errores de la operacion
        if (error.code === "ER_DUP_ENTRY") {
            console.log("El usuario admin ya existe");
        } else {
            console.error("Error:", error.message);
        }
    } finally {
        //Cierra las conexiones a la base de datos
        await conexion.end();
    }
}

//Ejecuta la funcion
crearUsuario();
