
 //Importa Express para crear el servidor y administrar las rutas HTTP
const express = require("express");

//Importa CORS para permitir solicitudes desde la aplicacion movil
const cors = require("cors");

//Importa bcrypt para comprobar las contraseñas almacenadas de forma segura
const bcrypt = require("bcrypt");

//Importa la conexion a TiDB Cloud configurada en db.js
const conexion = require("./db");

//Crea una instancia de Express para configurar nuestra API
const app = express();

//Obtiene el puerto del entorno o utiliza el puerto 3000 por defecto
const PORT = process.env.PORT || 3000;

//Habilita las solicitudes de otros origenes mediante CORS
app.use(cors());

//Permite recibir y procesar datos enviados en formato JSON
app.use(express.json());

//Define la ruta principal para comprobar que la API funciona
app.get("/", (req, res) => {
    //Devuelve un mensaje de confirmacion en formato JSON
    res.json({
        mensaje: "API de Skyrim Mobile funcionando"
    });
});

//Define la ruta GET para obtener o buscar ingredientes
app.get("/api/ingredientes", async (req, res) => {
    try {
        //Obtiene el texto de busqueda enviado como parametro en la URL
        const busqueda = req.query.buscar;

        //Prepara la consulta SQL para obtener todos los ingredientes
        let sql = "SELECT * FROM ingredientes";

        //Crea un arreglo para almacenar los parametros de la consulta
        let parametros = [];

        //Comprueba si se recibio un texto de busqueda valido

        if (typeof busqueda === "string" && busqueda.trim()) {
            //Convierte los campos a minusculas para buscar sin distinguir mayusculas
            sql += ` WHERE LOWER(Nombre) LIKE ?
                    OR LOWER(Efecto1) LIKE ?
                    OR LOWER(Efecto2) LIKE ?
                    OR LOWER(Efecto3) LIKE ?
                    OR LOWER(Efecto4) LIKE ?`;

            //Convierte el texto ingresado a minusculas y permite coincidencias parciales
            const termino = `%${busqueda.trim().toLowerCase()}%`;

            //Agrega un parametro por cada campo que participa en la busqueda
            parametros.push(termino, termino, termino, termino, termino);
        }


        //Ordena alfabeticamente los ingredientes por su nombre
        sql += " ORDER BY Nombre";

        //Ejecuta la consulta SQL utilizando los parametros correspondientes
        const [ingredientes] = await conexion.query(sql, parametros);

        //Devuelve los ingredientes encontrados en formato JSON
        res.json(ingredientes);

    } catch (error) {
        //Muestra el detalle del error en la consola del servidor
        console.error("Error al buscar ingredientes:", error.message);

        //Devuelve el codigo 500 cuando ocurre un error en el servidor
        res.status(500).json({
            error: "No se pudieron obtener los ingredientes"
        });
    }
});

//Define la ruta POST para agregar un ingrediente a la base de datos
app.post("/api/ingredientes", async (req, res) => {
    try {
        //Extrae los datos del ingrediente enviados desde la aplicacion
        const {
            Nombre,
            Efecto1,
            Efecto2,
            Efecto3,
            Efecto4,
            Calidad
        } = req.body;

        //Agrupa los campos de texto para comprobar que sean validos
        const textos = [Nombre, Efecto1, Efecto2, Efecto3, Efecto4];

        //Comprueba que todos los campos sean textos y no esten vacios
        if (textos.some(valor =>
            typeof valor !== "string" || !valor.trim()
        )) {
            //Devuelve el codigo 400 cuando falta algun campo obligatorio
            return res.status(400).json({
                error: "Todos los campos de texto son obligatorios"
            });
        }

        //Comprueba que la calidad sea un numero entero entre 1 y 3
        if (!Number.isInteger(Calidad) || Calidad < 1 || Calidad > 3) {
            //Informa que el valor de calidad ingresado es incorrecto
            return res.status(400).json({
                error: "La calidad debe ser un numero entero entre 1 y 3"
            });
        }

        //Inserta el nuevo ingrediente utilizando una consulta parametrizada
        const [resultado] = await conexion.execute(
            `INSERT INTO ingredientes
            (Nombre, Efecto1, Efecto2, Efecto3, Efecto4, Calidad)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                //Elimina los espacios innecesarios del nombre
                Nombre.trim(),

                //Elimina los espacios innecesarios del primer efecto
                Efecto1.trim(),

                //Elimina los espacios innecesarios del segundo efecto
                Efecto2.trim(),

                //Elimina los espacios innecesarios del tercer efecto
                Efecto3.trim(),

                //Elimina los espacios innecesarios del cuarto efecto
                Efecto4.trim(),

                //Envia la calidad seleccionada para el ingrediente
                Calidad
            ]
        );

        //Devuelve el codigo 201 e informa el ID generado por TiDB
        res.status(201).json({
            mensaje: "Ingrediente agregado correctamente",
            ID: resultado.insertId
        });

    } catch (error) {
        //Muestra el error ocurrido durante la insercion del ingrediente
        console.error("Error al agregar ingrediente:", error.message);

        //Informa que no fue posible guardar el ingrediente
        res.status(500).json({
            error: "No se pudo agregar el ingrediente"
        });
    }
});

//Define la ruta PUT para modificar un ingrediente existente
app.put("/api/ingredientes/:id", async (req, res) => {
    try {
        //Obtiene el ID enviado en la URL y lo convierte a numero
        const id = Number(req.params.id);

        //Extrae los nuevos datos del ingrediente enviados en el cuerpo
        const {
            Nombre,
            Efecto1,
            Efecto2,
            Efecto3,
            Efecto4,
            Calidad
        } = req.body;

        //Comprueba que el ID sea un numero entero seguro y positivo
        if (!Number.isSafeInteger(id) || id <= 0) {
            //Devuelve un error cuando el ID recibido no es valido
            return res.status(400).json({
                error: "ID invalido"
            });
        }

        //Agrupa los campos de texto que deben ser validados
        const textos = [Nombre, Efecto1, Efecto2, Efecto3, Efecto4];

        //Comprueba que todos los campos sean textos y tengan contenido
        if (textos.some(valor =>
            typeof valor !== "string" || !valor.trim()
        )) {
            //Informa que los campos de texto son obligatorios
            return res.status(400).json({
                error: "Todos los campos de texto son obligatorios"
            });
        }

        //Comprueba que la calidad sea un entero entre 1 y 3
        if (!Number.isInteger(Calidad) || Calidad < 1 || Calidad > 3) {
            //Devuelve un error cuando la calidad no es valida
            return res.status(400).json({
                error: "La calidad debe estar entre 1 y 3"
            });
        }

        //Actualiza los datos del ingrediente que coincide con el ID recibido
        const [resultado] = await conexion.execute(
            `UPDATE ingredientes
             SET Nombre = ?, Efecto1 = ?, Efecto2 = ?,
                 Efecto3 = ?, Efecto4 = ?, Calidad = ?
             WHERE ID = ?`,
            [
                //Envia el nuevo nombre sin espacios innecesarios
                Nombre.trim(),

                //Envia el nuevo primer efecto
                Efecto1.trim(),

                //Envia el nuevo segundo efecto
                Efecto2.trim(),

                //Envia el nuevo tercer efecto
                Efecto3.trim(),

                //Envia el nuevo cuarto efecto
                Efecto4.trim(),

                //Envia el nuevo valor de calidad
                Calidad,

                //Identifica el ingrediente que se debe modificar
                id
            ]
        );

        //Comprueba si la consulta encontro un ingrediente para actualizar
        if (resultado.affectedRows === 0) {
            //Devuelve el codigo 404 cuando no existe el ingrediente
            return res.status(404).json({
                error: "Ingrediente no encontrado"
            });
        }

        //Confirma que el ingrediente fue modificado correctamente
        res.json({
            mensaje: "Ingrediente modificado correctamente",
            ID: id
        });

    } catch (error) {
        //Muestra el error ocurrido durante la modificacion
        console.error("Error al modificar ingrediente:", error.message);

        //Informa que no fue posible modificar el ingrediente
        res.status(500).json({
            error: "No se pudo modificar el ingrediente"
        });
    }
});

//Define la ruta DELETE para eliminar un ingrediente por su ID
app.delete("/api/ingredientes/:id", async (req, res) => {
    try {
        //Obtiene el ID desde la URL y lo convierte a numero
        const id = Number(req.params.id);

        //Comprueba que el ID sea un numero entero seguro y positivo
        if (!Number.isSafeInteger(id) || id <= 0) {
            //Devuelve un error cuando el ID recibido no es valido
            return res.status(400).json({
                error: "ID invalido"
            });
        }

        //Elimina de la base de datos el ingrediente con el ID indicado
        const [resultado] = await conexion.execute(
            "DELETE FROM ingredientes WHERE ID = ?",
            [id]
        );

        //Comprueba si se encontro un ingrediente para eliminar
        if (resultado.affectedRows === 0) {
            //Informa que el ingrediente solicitado no existe
            return res.status(404).json({
                error: "Ingrediente no encontrado"
            });
        }

        //Confirma que el ingrediente fue eliminado correctamente
        res.json({
            mensaje: "Ingrediente eliminado correctamente",
            ID: id
        });

    } catch (error) {
        //Muestra el error ocurrido durante la eliminacion
        console.error("Error al eliminar ingrediente:", error.message);

        //Informa que no fue posible eliminar el ingrediente
        res.status(500).json({
            error: "No se pudo eliminar el ingrediente"
        });
    }
});

//Define la ruta POST para validar el inicio de sesion
app.post("/api/login", async (req, res) => {
    try {
        //Obtiene el usuario y la contraseña enviados desde la aplicacion
        const { usuario, password } = req.body;

        //Comprueba que ambos datos sean textos y no esten vacios
        if (
            typeof usuario !== "string" ||
            typeof password !== "string" ||
            !usuario.trim() ||
            !password
        ) {
            //Informa que el usuario y la contraseña son obligatorios
            return res.status(400).json({
                error: "Usuario y contraseña obligatorios"
            });
        }

        //Busca en TiDB el usuario que coincide con el nombre ingresado
        const [usuarios] = await conexion.execute(
            "SELECT * FROM usuarios WHERE Usuario = ?",
            [usuario.trim()]
        );

        //Comprueba si la consulta encontro algun usuario
        if (usuarios.length === 0) {
            //Devuelve el codigo 401 cuando el usuario no existe
            return res.status(401).json({
                error: "Credenciales incorrectas"
            });
        }

        //Obtiene el primer usuario encontrado en la consulta
        const usuarioEncontrado = usuarios[0];

        //Compara la contraseña ingresada con el hash guardado en TiDB
        const passwordCorrecta = await bcrypt.compare(
            password,
            usuarioEncontrado.PasswordHash
        );

        //Comprueba si la contraseña ingresada es incorrecta
        if (!passwordCorrecta) {
            //Rechaza el inicio de sesion cuando la contraseña no coincide
            return res.status(401).json({
                error: "Credenciales incorrectas"
            });
        }

        //Confirma el inicio de sesion y devuelve los datos publicos del usuario
        res.json({
            mensaje: "Inicio de sesion exitoso",
            usuario: {
                //Devuelve el identificador del usuario
                ID: usuarioEncontrado.ID,

                //Devuelve el nombre del usuario
                Nombre: usuarioEncontrado.Nombre,

                //Devuelve el nombre utilizado para iniciar sesion
                Usuario: usuarioEncontrado.Usuario
            }
        });

    } catch (error) {
        //Muestra el error ocurrido durante la validacion del login
        console.error("Error en login:", error.message);

        //Informa que no fue posible completar el inicio de sesion
        res.status(500).json({
            error: "No se pudo iniciar sesion"
        });
    }
});

//Inicia el servidor Express utilizando el puerto configurado
app.listen(PORT, () => {
    //Muestra en la consola la direccion local del servidor
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
