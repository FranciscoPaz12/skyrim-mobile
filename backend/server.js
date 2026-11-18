//Bibliotecas y conexion a TiDB
const express = require("express");

const cors = require("cors");

const bcrypt = require("bcrypt");

const conexion = require("./db");

const app = express();

const PORT = process.env.PORT || 3000;

//Configuracion del servidor
app.use(cors());

app.use(express.json());

//Comprueba que la API este funcionando
app.get("/", (req, res) => {
    res.json({
        mensaje: "API de Skyrim Mobile funcionando"
    });
});

//Consulta y busca ingredientes
app.get("/api/ingredientes", async (req, res) => {
    try {
        const busqueda = req.query.buscar;

        let sql = "SELECT * FROM ingredientes";

        let parametros = [];


        if (typeof busqueda === "string" && busqueda.trim()) {
            sql += ` WHERE LOWER(Nombre) LIKE ?
                    OR LOWER(Efecto1) LIKE ?
                    OR LOWER(Efecto2) LIKE ?
                    OR LOWER(Efecto3) LIKE ?
                    OR LOWER(Efecto4) LIKE ?`;

            const termino = `%${busqueda.trim().toLowerCase()}%`;

            parametros.push(termino, termino, termino, termino, termino);
        }


        sql += " ORDER BY Nombre";

        const [ingredientes] = await conexion.query(sql, parametros);

        res.json(ingredientes);

    } catch (error) {
        console.error("Error al buscar ingredientes:", error.message);

        res.status(500).json({
            error: "No se pudieron obtener los ingredientes"
        });
    }
});

//Valida y guarda un ingrediente
app.post("/api/ingredientes", async (req, res) => {
    try {
        const {Nombre, Efecto1, Efecto2, Efecto3, Efecto4, Calidad} = req.body;

        const textos = [Nombre, Efecto1, Efecto2, Efecto3, Efecto4];

        if (textos.some(valor =>
            typeof valor !== "string" || !valor.trim()
        )) {
            return res.status(400).json({
                error: "Todos los campos de texto son obligatorios"
            });
        }

        if (!Number.isInteger(Calidad) || Calidad < 1 || Calidad > 3) {
            return res.status(400).json({
                error: "La calidad debe ser un numero entero entre 1 y 3"
            });
        }

        const [resultado] = await conexion.execute(
            `INSERT INTO ingredientes
            (Nombre, Efecto1, Efecto2, Efecto3, Efecto4, Calidad)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [Nombre.trim(), Efecto1.trim(), Efecto2.trim(), Efecto3.trim(), Efecto4.trim(), Calidad]
        );

        res.status(201).json({
            mensaje: "Ingrediente agregado correctamente",
            ID: resultado.insertId
        });

    } catch (error) {
        console.error("Error al agregar ingrediente:", error.message);

        res.status(500).json({
            error: "No se pudo agregar el ingrediente"
        });
    }
});

//Modifica un ingrediente por su ID
app.put("/api/ingredientes/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        const {Nombre, Efecto1, Efecto2, Efecto3, Efecto4, Calidad} = req.body;

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "ID invalido"
            });
        }

        const textos = [Nombre, Efecto1, Efecto2, Efecto3, Efecto4];

        if (textos.some(valor =>
            typeof valor !== "string" || !valor.trim()
        )) {
            return res.status(400).json({
                error: "Todos los campos de texto son obligatorios"
            });
        }

        if (!Number.isInteger(Calidad) || Calidad < 1 || Calidad > 3) {
            return res.status(400).json({
                error: "La calidad debe estar entre 1 y 3"
            });
        }

        const [resultado] = await conexion.execute(
            `UPDATE ingredientes
             SET Nombre = ?, Efecto1 = ?, Efecto2 = ?,
                 Efecto3 = ?, Efecto4 = ?, Calidad = ?
             WHERE ID = ?`,
            [Nombre.trim(), Efecto1.trim(), Efecto2.trim(), Efecto3.trim(), Efecto4.trim(), Calidad, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: "Ingrediente no encontrado"
            });
        }

        res.json({
            mensaje: "Ingrediente modificado correctamente",
            ID: id
        });

    } catch (error) {
        console.error("Error al modificar ingrediente:", error.message);

        res.status(500).json({
            error: "No se pudo modificar el ingrediente"
        });
    }
});

//Elimina un ingrediente por su ID
app.delete("/api/ingredientes/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "ID invalido"
            });
        }

        const [resultado] = await conexion.execute(
            "DELETE FROM ingredientes WHERE ID = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: "Ingrediente no encontrado"
            });
        }

        res.json({
            mensaje: "Ingrediente eliminado correctamente",
            ID: id
        });

    } catch (error) {
        console.error("Error al eliminar ingrediente:", error.message);

        res.status(500).json({
            error: "No se pudo eliminar el ingrediente"
        });
    }
});

//Comprueba usuario y contraseña
app.post("/api/login", async (req, res) => {
    try {
        const { usuario, password } = req.body;

        if (
            typeof usuario !== "string" ||
            typeof password !== "string" ||
            !usuario.trim() ||
            !password
        ) {
            return res.status(400).json({
                error: "Usuario y contraseña obligatorios"
            });
        }

        const [usuarios] = await conexion.execute(
            "SELECT * FROM usuarios WHERE Usuario = ?",
            [usuario.trim()]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                error: "Credenciales incorrectas"
            });
        }

        const usuarioEncontrado = usuarios[0];

        const passwordCorrecta = await bcrypt.compare(
            password,
            usuarioEncontrado.PasswordHash
        );

        if (!passwordCorrecta) {
            return res.status(401).json({
                error: "Credenciales incorrectas"
            });
        }

        res.json({
            mensaje: "Inicio de sesion exitoso",
            usuario: {ID: usuarioEncontrado.ID, Nombre: usuarioEncontrado.Nombre, Usuario: usuarioEncontrado.Usuario}
        });

    } catch (error) {
        console.error("Error en login:", error.message);

        res.status(500).json({
            error: "No se pudo iniciar sesion"
        });
    }
});

//Obtiene pociones, ingredientes y efectos
app.get("/api/pociones", async (req, res) => {
    try {
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

        const [efectos] = await conexion.query(
            `SELECT PocionID, NombreEfecto
             FROM efectospocion
             ORDER BY ID`
        );

        const resultado = pociones.map(pocion => ({
            ...pocion,
            Efectos: efectos
                .filter(efecto => efecto.PocionID === pocion.ID)
                .map(efecto => efecto.NombreEfecto)
        }));

        res.json(resultado);

    } catch (error) {
        console.error("Error al obtener pociones:", error.message);

        res.status(500).json({
            error: "No se pudieron obtener las pociones"
        });
    }
});

//Calcula y guarda una pocion en una transaccion
app.post("/api/pociones", async (req, res) => {
    let cliente;

    try {
        const { Nombre, Ingrediente1ID, Ingrediente2ID } = req.body;

        if (typeof Nombre !== "string" || !Nombre.trim()) {
            return res.status(400).json({
                error: "El nombre de la pocion es obligatorio"
            });
        }

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

        const [ingredientes] = await conexion.query(
            "SELECT * FROM ingredientes WHERE ID IN (?, ?)",
            [Ingrediente1ID, Ingrediente2ID]
        );

        if (ingredientes.length !== 2) {
            return res.status(404).json({
                error: "Uno o ambos ingredientes no existen"
            });
        }

        const efectos1 = [ingredientes[0].Efecto1, ingredientes[0].Efecto2, ingredientes[0].Efecto3, ingredientes[0].Efecto4];

        const efectos2 = [ingredientes[1].Efecto1, ingredientes[1].Efecto2, ingredientes[1].Efecto3, ingredientes[1].Efecto4];

        const efectosCompartidos = [...new Set(
            efectos1.filter(efecto =>
                efectos2.some(otro =>
                    otro.trim().toLowerCase() === efecto.trim().toLowerCase()
                )
            )
        )];

        if (efectosCompartidos.length === 0) {
            return res.status(400).json({
                error: "Los ingredientes no comparten efectos"
            });
        }

        const promedio = (
            ingredientes[0].Calidad + ingredientes[1].Calidad
        ) / 2;

        const magnitud = Math.ceil(promedio);

        cliente = await conexion.getConnection();

        await cliente.beginTransaction();

        const [resultado] = await cliente.execute(
            `INSERT INTO pociones
             (Nombre, Ingrediente1ID, Ingrediente2ID, Magnitud)
             VALUES (?, ?, ?, ?)`,
            [Nombre.trim(), Ingrediente1ID, Ingrediente2ID, magnitud]
        );

        for (const efecto of efectosCompartidos) {
            await cliente.execute(
                `INSERT INTO efectospocion
                 (PocionID, NombreEfecto)
                 VALUES (?, ?)`,
                [resultado.insertId, efecto]
            );
        }

        await cliente.commit();

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
        if (cliente) {
            await cliente.rollback();
        }

        console.error("Error al crear pocion:", error.message);

        res.status(500).json({
            error: "No se pudo crear la pocion"
        });

    } finally {
        if (cliente) {
            cliente.release();
        }
    }
});

//Elimina una pocion por su ID
app.delete("/api/pociones/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "ID invalido"
            });
        }

        const [resultado] = await conexion.execute(
            "DELETE FROM pociones WHERE ID = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: "Pocion no encontrada"
            });
        }

        res.json({
            mensaje: "Pocion eliminada correctamente",
            ID: id
        });

    } catch (error) {
        console.error("Error al eliminar pocion:", error.message);

        res.status(500).json({
            error: "No se pudo eliminar la pocion"
        });
    }
});

//Recalcula y modifica una pocion
app.put("/api/pociones/:id", async (req, res) => {
    let cliente;

    try {
        const id = Number(req.params.id);
        const { Nombre, Ingrediente1ID, Ingrediente2ID } = req.body;

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "ID invalido"
            });
        }

        if (typeof Nombre !== "string" || !Nombre.trim()) {
            return res.status(400).json({
                error: "El nombre de la pocion es obligatorio"
            });
        }

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

        cliente = await conexion.getConnection();
        await cliente.beginTransaction();

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

        const efectos1 = [ingredientes[0].Efecto1, ingredientes[0].Efecto2, ingredientes[0].Efecto3, ingredientes[0].Efecto4];

        const efectos2 = [ingredientes[1].Efecto1, ingredientes[1].Efecto2, ingredientes[1].Efecto3, ingredientes[1].Efecto4];

        const efectosCompartidos = [...new Set(
            efectos1.filter(efecto =>
                efectos2.some(otro =>
                    otro.trim().toLowerCase() === efecto.trim().toLowerCase()
                )
            )
        )];

        if (efectosCompartidos.length === 0) {
            await cliente.rollback();
            return res.status(400).json({
                error: "Los ingredientes no comparten efectos"
            });
        }

        const promedio = (
            ingredientes[0].Calidad + ingredientes[1].Calidad
        ) / 2;

        const magnitud = Math.ceil(promedio);

        await cliente.execute(
            `UPDATE pociones
             SET Nombre = ?, Ingrediente1ID = ?,
                 Ingrediente2ID = ?, Magnitud = ?
             WHERE ID = ?`,
            [Nombre.trim(), Ingrediente1ID, Ingrediente2ID, magnitud, id]
        );

        await cliente.execute(
            "DELETE FROM efectospocion WHERE PocionID = ?",
            [id]
        );

        for (const efecto of efectosCompartidos) {
            await cliente.execute(
                `INSERT INTO efectospocion
                 (PocionID, NombreEfecto)
                 VALUES (?, ?)`,
                [id, efecto]
            );
        }

        await cliente.commit();

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
        if (cliente) {
            await cliente.rollback();
        }

        console.error("Error al modificar pocion:", error.message);

        res.status(500).json({
            error: "No se pudo modificar la pocion"
        });

    } finally {
        if (cliente) {
            cliente.release();
        }
    }
});

//Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
