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

 //Define la ruta GET para consultar las pociones registradas
app.get("/api/pociones", async (req, res) => {
    try {
        //Obtiene las pociones y los nombres de sus ingredientes
        const [pociones] = await conexion.query(
            `SELECT
                p.ID,
                p.Nombre,
                p.Ingrediente1ID,
                p.Ingrediente2ID,
                p.Magnitud,
                i1.Nombre AS Ingrediente1,
                i2.Nombre AS Ingrediente2
            FROM pociones p
            INNER JOIN ingredientes i1
                ON p.Ingrediente1ID = i1.ID
            INNER JOIN ingredientes i2
                ON p.Ingrediente2ID = i2.ID
            ORDER BY p.Nombre`
        );

        //Obtiene los efectos asociados a las pociones
        const [efectos] = await conexion.query(
            `SELECT PocionID, NombreEfecto
             FROM efectospocion
             ORDER BY ID`
        );

        //Agrega los efectos correspondientes a cada pocion
        const resultado = pociones.map(pocion => ({
            ...pocion,
            Efectos: efectos
                .filter(efecto => efecto.PocionID === pocion.ID)
                .map(efecto => efecto.NombreEfecto)
        }));

        //Devuelve las pociones con sus ingredientes y efectos
        res.json(resultado);

    } catch (error) {
        //Muestra el error en la consola del servidor
        console.error("Error al obtener pociones:", error.message);

        //Informa que no fue posible consultar las pociones
        res.status(500).json({
            error: "No se pudieron obtener las pociones"
        });
    }
});

 //Define la ruta POST para crear una pocion combinando dos ingredientes
app.post("/api/pociones", async (req, res) => {
    //Prepara una conexion para realizar una transaccion
    let cliente;

    try {
        //Obtiene los datos enviados desde la aplicacion
        const { Nombre, Ingrediente1ID, Ingrediente2ID } = req.body;

        //Comprueba que el nombre sea valido
        if (typeof Nombre !== "string" || !Nombre.trim()) {
            return res.status(400).json({
                error: "El nombre de la pocion es obligatorio"
            });
        }

        //Comprueba que los identificadores sean numeros enteros positivos
        if (
            !Number.isSafeInteger(Ingrediente1ID) ||
            !Number.isSafeInteger(Ingrediente2ID) ||
            Ingrediente1ID <= 0 ||
            Ingrediente2ID <= 0 ||
            Ingrediente1ID === Ingrediente2ID
        ) {
            return res.status(400).json({
                error: "Selecciona dos ingredientes diferentes y validos"
            });
        }

        //Obtiene los ingredientes seleccionados desde TiDB Cloud
        const [ingredientes] = await conexion.query(
            "SELECT * FROM ingredientes WHERE ID IN (?, ?)",
            [Ingrediente1ID, Ingrediente2ID]
        );

        //Comprueba que ambos ingredientes existan
        if (ingredientes.length !== 2) {
            return res.status(404).json({
                error: "Uno o ambos ingredientes no existen"
            });
        }

        //Obtiene los efectos del primer ingrediente
        const efectos1 = [
            ingredientes[0].Efecto1,
            ingredientes[0].Efecto2,
            ingredientes[0].Efecto3,
            ingredientes[0].Efecto4
        ];

        //Obtiene los efectos del segundo ingrediente
        const efectos2 = [
            ingredientes[1].Efecto1,
            ingredientes[1].Efecto2,
            ingredientes[1].Efecto3,
            ingredientes[1].Efecto4
        ];

        //Calcula los efectos que comparten ambos ingredientes
        const efectosCompartidos = [...new Set(
            efectos1.filter(efecto =>
                efectos2.some(otro =>
                    otro.trim().toLowerCase() === efecto.trim().toLowerCase()
                )
            )
        )];

        //Impide crear una pocion sin efectos compartidos
        if (efectosCompartidos.length === 0) {
            return res.status(400).json({
                error: "Los ingredientes no comparten efectos"
            });
        }

        //Calcula el promedio de calidad de ambos ingredientes
        const promedio = (
            ingredientes[0].Calidad + ingredientes[1].Calidad
        ) / 2;

        //Redondea hacia arriba para obtener la magnitud
        const magnitud = Math.ceil(promedio);

        //Obtiene una conexion exclusiva para guardar todos los datos juntos
        cliente = await conexion.getConnection();

        //Inicia la transaccion
        await cliente.beginTransaction();

        //Guarda la pocion y obtiene su identificador
        const [resultado] = await cliente.execute(
            `INSERT INTO pociones
             (Nombre, Ingrediente1ID, Ingrediente2ID, Magnitud)
             VALUES (?, ?, ?, ?)`,
            [
                Nombre.trim(),
                Ingrediente1ID,
                Ingrediente2ID,
                magnitud
            ]
        );

        //Guarda cada efecto asociado a la nueva pocion
        for (const efecto of efectosCompartidos) {
            await cliente.execute(
                `INSERT INTO efectospocion
                 (PocionID, NombreEfecto)
                 VALUES (?, ?)`,
                [resultado.insertId, efecto]
            );
        }

        //Confirma todos los cambios realizados
        await cliente.commit();

        //Devuelve la informacion de la pocion creada
        res.status(201).json({
            mensaje: "Pocion creada correctamente",
            ID: resultado.insertId,
            Nombre: Nombre.trim(),
            Ingrediente1ID,
            Ingrediente2ID,
            Magnitud: magnitud,
            Efectos: efectosCompartidos
        });

    } catch (error) {
        //Revierte los cambios si ocurre un error
        if (cliente) {
            await cliente.rollback();
        }

        //Muestra el error en la consola
        console.error("Error al crear pocion:", error.message);

        //Informa que no fue posible guardar la pocion
        res.status(500).json({
            error: "No se pudo crear la pocion"
        });

    } finally {
        //Libera la conexion para que pueda reutilizarse
        if (cliente) {
            cliente.release();
        }
    }
});

 //Define la ruta DELETE para eliminar una pocion por su ID
app.delete("/api/pociones/:id", async (req, res) => {
    try {
        //Obtiene el ID de la pocion desde la URL
        const id = Number(req.params.id);

        //Comprueba que el ID sea un numero entero positivo
        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "ID invalido"
            });
        }

        //Elimina la pocion indicada de TiDB Cloud
        const [resultado] = await conexion.execute(
            "DELETE FROM pociones WHERE ID = ?",
            [id]
        );

        //Comprueba si la pocion existia
        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: "Pocion no encontrada"
            });
        }

        //Confirma que la pocion fue eliminada
        res.json({
            mensaje: "Pocion eliminada correctamente",
            ID: id
        });

    } catch (error) {
        //Muestra el error en la consola del servidor
        console.error("Error al eliminar pocion:", error.message);

        //Informa que no fue posible eliminar la pocion
        res.status(500).json({
            error: "No se pudo eliminar la pocion"
        });
    }
});

 //Define la ruta PUT para modificar una pocion existente
app.put("/api/pociones/:id", async (req, res) => {
    let cliente;

    try {
        //Obtiene el ID de la pocion y sus nuevos datos
        const id = Number(req.params.id);
        const { Nombre, Ingrediente1ID, Ingrediente2ID } = req.body;

        //Comprueba que el ID sea valido
        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "ID invalido"
            });
        }

        //Comprueba que el nombre sea valido
        if (typeof Nombre !== "string" || !Nombre.trim()) {
            return res.status(400).json({
                error: "El nombre de la pocion es obligatorio"
            });
        }

        //Comprueba que se seleccionaron dos ingredientes diferentes
        if (
            !Number.isSafeInteger(Ingrediente1ID) ||
            !Number.isSafeInteger(Ingrediente2ID) ||
            Ingrediente1ID <= 0 ||
            Ingrediente2ID <= 0 ||
            Ingrediente1ID === Ingrediente2ID
        ) {
            return res.status(400).json({
                error: "Selecciona dos ingredientes diferentes y validos"
            });
        }

        //Obtiene una conexion para trabajar con una transaccion
        cliente = await conexion.getConnection();
        await cliente.beginTransaction();

        //Comprueba que la pocion exista
        const [pociones] = await cliente.execute(
            "SELECT ID FROM pociones WHERE ID = ?",
            [id]
        );

        if (pociones.length === 0) {
            await cliente.rollback();
            return res.status(404).json({
                error: "Pocion no encontrada"
            });
        }

        //Obtiene los ingredientes seleccionados
        const [ingredientes] = await cliente.query(
            "SELECT * FROM ingredientes WHERE ID IN (?, ?)",
            [Ingrediente1ID, Ingrediente2ID]
        );

        if (ingredientes.length !== 2) {
            await cliente.rollback();
            return res.status(404).json({
                error: "Uno o ambos ingredientes no existen"
            });
        }

        //Obtiene los efectos de ambos ingredientes
        const efectos1 = [
            ingredientes[0].Efecto1,
            ingredientes[0].Efecto2,
            ingredientes[0].Efecto3,
            ingredientes[0].Efecto4
        ];

        const efectos2 = [
            ingredientes[1].Efecto1,
            ingredientes[1].Efecto2,
            ingredientes[1].Efecto3,
            ingredientes[1].Efecto4
        ];

        //Calcula los efectos compartidos
        const efectosCompartidos = [...new Set(
            efectos1.filter(efecto =>
                efectos2.some(otro =>
                    otro.trim().toLowerCase() === efecto.trim().toLowerCase()
                )
            )
        )];

        //Impide guardar pociones sin efectos compartidos
        if (efectosCompartidos.length === 0) {
            await cliente.rollback();
            return res.status(400).json({
                error: "Los ingredientes no comparten efectos"
            });
        }

        //Calcula el promedio de calidad de los ingredientes
        const promedio = (
            ingredientes[0].Calidad + ingredientes[1].Calidad
        ) / 2;

        //Redondea hacia arriba para obtener la magnitud
        const magnitud = Math.ceil(promedio);

        //Actualiza los datos principales de la pocion
        await cliente.execute(
            `UPDATE pociones
             SET Nombre = ?, Ingrediente1ID = ?,
                 Ingrediente2ID = ?, Magnitud = ?
             WHERE ID = ?`,
            [
                Nombre.trim(),
                Ingrediente1ID,
                Ingrediente2ID,
                magnitud,
                id
            ]
        );

        //Elimina los efectos anteriores de la pocion
        await cliente.execute(
            "DELETE FROM efectospocion WHERE PocionID = ?",
            [id]
        );

        //Guarda los nuevos efectos compartidos
        for (const efecto of efectosCompartidos) {
            await cliente.execute(
                `INSERT INTO efectospocion
                 (PocionID, NombreEfecto)
                 VALUES (?, ?)`,
                [id, efecto]
            );
        }

        //Confirma todos los cambios realizados
        await cliente.commit();

        //Devuelve la pocion actualizada
        res.json({
            mensaje: "Pocion modificada correctamente",
            ID: id,
            Nombre: Nombre.trim(),
            Ingrediente1ID,
            Ingrediente2ID,
            Magnitud: magnitud,
            Efectos: efectosCompartidos
        });

    } catch (error) {
        //Revierte los cambios si ocurre un error
        if (cliente) {
            await cliente.rollback();
        }

        console.error("Error al modificar pocion:", error.message);

        res.status(500).json({
            error: "No se pudo modificar la pocion"
        });

    } finally {
        //Libera la conexion utilizada
        if (cliente) {
            cliente.release();
        }
    }
});

//Inicia el servidor Express utilizando el puerto configurado
app.listen(PORT, () => {
    //Muestra en la consola la direccion local del servidor
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
