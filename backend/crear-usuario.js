
//Importa bcrypt para proteger las contraseñas mediante hashes
const bcrypt = require("bcrypt");

//Importa la conexion a TiDB Cloud configurada en db.js
const conexion = require("./db");

//Define una funcion asincronica para crear un usuario en la base de datos
async function crearUsuario() {
    try {
        //Establece el nombre del usuario que se va a registrar
        const nombre = "Administrador";

        //Establece el nombre de usuario utilizado para iniciar sesion
        const usuario = "admin";

        //Obtiene la contraseña desde la variable ADMIN_PASSWORD del archivo .env
        const password = process.env.ADMIN_PASSWORD;

        //Comprueba que exista una contraseña y tenga al menos 12 caracteres
        if (!password || password.length < 12) {
            //Detiene la operacion e informa que la contraseña no cumple los requisitos
            throw new Error(
                "Configura ADMIN_PASSWORD con al menos 12 caracteres en .env"
            );
        }

        //Genera un hash de la contraseña utilizando bcrypt con un costo de 10
        const passwordHash = await bcrypt.hash(password, 10);

        /*
        //Inserta el nuevo usuario en TiDB mediante una consulta SQL parametrizada
        const [resultado] = await conexion.execute(
            `INSERT INTO usuarios (Nombre, Usuario, PasswordHash)
             VALUES (?, ?, ?)`,
            //Envia el nombre, usuario y hash a los parametros de la consulta
            [nombre, usuario, passwordHash]
        );
        */

        //Actualiza la contraseña del administrador existente en TiDB Cloud
        const [resultado] = await conexion.execute(
            "UPDATE usuarios SET PasswordHash = ? WHERE Usuario = ?",
            [passwordHash, usuario]
        );

        //Comprueba que se haya encontrado el usuario administrador
        if (resultado.affectedRows === 0) {
            throw new Error("No se encontro el usuario admin");
        }

        /*//Muestra un mensaje cuando el usuario se registra correctamente
        console.log("Usuario creado correctamente");

        //Muestra el identificador generado automaticamente por TiDB
        console.log("ID:", resultado.insertId);

        //Muestra el nombre de usuario registrado
        console.log("Usuario:", usuario);
        */

        //Confirma que la contraseña del administrador fue actualizada
        console.log("Contraseña actualizada correctamente");

        //Muestra el nombre del usuario modificado
        console.log("Usuario:", usuario);


    } catch (error) {
        //Comprueba si el error corresponde a un usuario duplicado
        if (error.code === "ER_DUP_ENTRY") {
            //Informa que el usuario admin ya se encuentra registrado
            console.log("El usuario admin ya existe");
        } else {
            //Muestra cualquier otro error ocurrido durante el registro
            console.error("Error:", error.message);
        }
    } finally {
        //Cierra el pool de conexiones al finalizar la operacion
        await conexion.end();
    }
}

//Ejecuta la funcion encargada de crear el usuario administrador
crearUsuario();
