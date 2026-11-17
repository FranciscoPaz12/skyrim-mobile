import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StyleSheet } from "react-native";
import axios from "axios";

//Define la direccion publica del backend
const API_URL = "https://skyrim-mobile-api.onrender.com";

//Define el formulario para crear pociones
export default function FormularioPocionScreen({ navigation, route }) {

    const pocionEditar = route.params?.pocion;

    const esEdicion = Boolean(pocionEditar);

    const [nombre, setNombre] = useState(pocionEditar?.Nombre ?? "");

    const [ingredientes, setIngredientes] = useState([]);

    const [ingrediente1, setIngrediente1] = useState(pocionEditar?.Ingrediente1ID ?? null);

    const [ingrediente2, setIngrediente2] = useState(pocionEditar?.Ingrediente2ID ?? null);

    const [cargando, setCargando] = useState(true);

    const [guardando, setGuardando] = useState(false);

    //Obtiene los ingredientes seleccionados
    const ingredienteSeleccionado1 = ingredientes.find(
        item => item.ID === ingrediente1
    );

    const ingredienteSeleccionado2 = ingredientes.find(
        item => item.ID === ingrediente2
    );

    //Calcula los efectos compartidos entre ambos ingredientes
    const efectosCompartidos = [];

    if (ingredienteSeleccionado1 && ingredienteSeleccionado2 &&
        ingrediente1 !== ingrediente2) {

        const efectos1 = [
            ingredienteSeleccionado1.Efecto1,
            ingredienteSeleccionado1.Efecto2,
            ingredienteSeleccionado1.Efecto3,
            ingredienteSeleccionado1.Efecto4
        ];

        const efectos2 = [
            ingredienteSeleccionado2.Efecto1,
            ingredienteSeleccionado2.Efecto2,
            ingredienteSeleccionado2.Efecto3,
            ingredienteSeleccionado2.Efecto4
        ];

        efectos1.forEach(efecto => {
            const compartido = efectos2.some(otro =>
                otro.trim().toLowerCase() === efecto.trim().toLowerCase()
            );

            if (compartido && !efectosCompartidos.some(
                existente => existente.trim().toLowerCase() === efecto.trim().toLowerCase()
            )) {
                efectosCompartidos.push(efecto);
            }
        });
    }

    //Calcula la magnitud estimada de la pocion
    const magnitud = ingredienteSeleccionado1 && ingredienteSeleccionado2
        ? Math.ceil(
            (Number(ingredienteSeleccionado1.Calidad) +
            Number(ingredienteSeleccionado2.Calidad)) / 2
        )
        : null;

    //Obtiene los ingredientes registrados en la base de datos
    useEffect(() => {
        async function cargarIngredientes() {
            try {
                //Consulta los ingredientes mediante Axios
                const respuesta = await axios.get(`${API_URL}/api/ingredientes`);

                setIngredientes(respuesta.data);

            } catch (error) {
                Alert.alert("Error", "No se pudieron cargar los ingredientes");
            } finally {
                setCargando(false);
            }
        }

        cargarIngredientes();
    }, []);

    //Envia la nueva pocion al backend
    async function guardarPocion() {
        if (!nombre.trim()) {
            Alert.alert("Atencion", "Ingresa un nombre para la pocion");
            return;
        }

        if (ingrediente1 === null || ingrediente2 === null) {
            Alert.alert("Atencion", "Selecciona dos ingredientes");
            return;
        }

        if (ingrediente1 === ingrediente2) {
            Alert.alert("Atencion", "Debes seleccionar ingredientes diferentes");
            return;
        }

        try {
            setGuardando(true);

            //Prepara los datos de la pocion
            const datosPocion = {
                Nombre: nombre.trim(),
                Ingrediente1ID: ingrediente1,
                Ingrediente2ID: ingrediente2
            };

            //Selecciona el endpoint segun la operacion
            const url = esEdicion
                ? `${API_URL}/api/pociones/${pocionEditar.ID}`
                : `${API_URL}/api/pociones`;

            //Envia los datos mediante Axios
            if (esEdicion) {
                await axios.put(url, datosPocion);
            } else {
                await axios.post(url, datosPocion);
            }

            Alert.alert(
                "Exito",
                esEdicion ? "Pocion actualizada correctamente" : "Pocion creada correctamente"
            );

            navigation.navigate("Pociones");

        } catch (error) {
            //Recupera el mensaje enviado por el backend
            if (error.response) {
                const datos = error.response.data;

                Alert.alert(
                    esEdicion ? "No se pudo editar la pocion" : "No se pudo crear la pocion",
                    datos?.error || datos?.mensaje || "Verifica los ingredientes seleccionados"
                );
            } else {
                Alert.alert("Error", "No se pudo conectar con el servidor");
            }

        } finally {
            setGuardando(false);
        }
    }

    //Muestra los ingredientes disponibles para cada seleccion
    function mostrarIngredientes(seleccionado, cambiarSeleccion) {
        return ingredientes.map(ingrediente => (
            <TouchableOpacity
                key={ingrediente.ID}
                style={[
                    styles.opcion,
                    seleccionado === ingrediente.ID && styles.opcionSeleccionada
                ]}
                onPress={() => cambiarSeleccion(ingrediente.ID)}
            >
                <Text style={styles.textoOpcion}>
                    {ingrediente.Nombre}
                </Text>
            </TouchableOpacity>
        ));
    }

    if (cargando) {
        return (
            <View style={styles.contenedorCarga}>
                <ActivityIndicator size="large" color="#D8C29D" />
                <Text style={styles.texto}>Cargando ingredientes...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.contenedor}
            contentContainerStyle={styles.contenido}
            keyboardShouldPersistTaps="handled"
        >

            <Text style={styles.titulo}>
                {esEdicion ? "EDITAR POCION" : "CREAR POCION"}
            </Text>

            {/*Permite navegar a las otras secciones*/}
            <TouchableOpacity
                style={styles.botonNavegacion}
                onPress={() => navigation.navigate("Ingredientes")}
            >
                <Text style={styles.textoBoton}>VER INGREDIENTES</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.botonNavegacion}
                onPress={() => navigation.navigate("Pociones")}
            >
                <Text style={styles.textoBoton}>VER POCIONES</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.botonNavegacion}
                onPress={() => navigation.navigate("Formulario")}
            >
                <Text style={styles.textoBoton}>CREAR INGREDIENTE</Text>
            </TouchableOpacity>

            {/*Permite ingresar el nombre de la pocion*/}
            <Text style={styles.etiqueta}>Nombre de la pocion</Text>
            <TextInput
                style={styles.entrada}
                placeholder="Ejemplo: Pocion de salud"
                placeholderTextColor="#999999"
                value={nombre}
                onChangeText={setNombre}
            />

            {/*Permite seleccionar el primer ingrediente*/}
            <Text style={styles.etiqueta}>Primer ingrediente</Text>
            {mostrarIngredientes(ingrediente1, setIngrediente1)}

            {/*Permite seleccionar el segundo ingrediente*/}
            <Text style={styles.etiqueta}>Segundo ingrediente</Text>
            {mostrarIngredientes(ingrediente2, setIngrediente2)}

            {/*Muestra una vista previa de la combinacion*/}
            {ingredienteSeleccionado1 && ingredienteSeleccionado2 &&
            ingrediente1 !== ingrediente2 && (
                <View style={styles.vistaPrevia}>
                    <Text style={styles.etiqueta}>EFECTOS COMPARTIDOS</Text>

                    {efectosCompartidos.length > 0 ? (
                        <>
                            {efectosCompartidos.map((efecto, indice) => (
                                <Text key={indice} style={styles.textoVistaPrevia}>
                                    • {efecto}
                                </Text>
                            ))}

                            <Text style={styles.textoVistaPrevia}>
                                Magnitud: {["", "I", "II", "III"][magnitud]}
                            </Text>
                        </>
                    ) : (
                        <Text style={styles.textoError}>
                            Los ingredientes no comparten efectos.
                        </Text>
                    )}
                </View>
            )}

            {/*Guarda la pocion en la base de datos*/}
            <TouchableOpacity
                style={styles.botonGuardar}
                onPress={guardarPocion}
                disabled={guardando}
            >
                <Text style={styles.textoGuardar}>
                    {guardando
                    ? "GUARDANDO..."
                    : esEdicion ? "ACTUALIZAR POCION" : "GUARDAR POCION"}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

//Define los estilos visuales del formulario
const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: "#161A1D"
    },
    contenido: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 100
    },
    contenedorCarga: {
        flex: 1,
        backgroundColor: "#161A1D",
        justifyContent: "center",
        alignItems: "center"
    },
    titulo: {
        color: "#D8C29D",
        fontSize: 26,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 24
    },
    etiqueta: {
        color: "#D8C29D",
        fontSize: 17,
        fontWeight: "bold",
        marginTop: 18,
        marginBottom: 10
    },
    entrada: {
        backgroundColor: "#292F33",
        borderWidth: 1,
        borderColor: "#665A45",
        borderRadius: 6,
        color: "#FFFFFF",
        fontSize: 16,
        padding: 14
    },
    opcion: {
        backgroundColor: "#292F33",
        borderWidth: 1,
        borderColor: "#665A45",
        borderRadius: 6,
        padding: 14,
        marginBottom: 8
    },
    opcionSeleccionada: {
        backgroundColor: "#52634C",
        borderColor: "#D8C29D"
    },
    textoOpcion: {
        color: "#FFFFFF",
        fontSize: 15
    },
    botonNavegacion: {
        backgroundColor: "#39434A",
        borderWidth: 1,
        borderColor: "#D8C29D",
        borderRadius: 6,
        padding: 12,
        alignItems: "center",
        marginBottom: 10
    },
    textoBoton: {
        color: "#D8C29D",
        fontSize: 14,
        fontWeight: "bold"
    },
    botonGuardar: {
        backgroundColor: "#665A45",
        borderRadius: 6,
        padding: 17,
        alignItems: "center",
        marginTop: 25
    },
    textoGuardar: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold"
    },
    texto: {
        color: "#FFFFFF",
        marginTop: 12
    },
    vistaPrevia: {
    backgroundColor: "#292F33",
    borderWidth: 1,
    borderColor: "#665A45",
    borderRadius: 8,
    padding: 16,
    marginTop: 20
    },
    textoVistaPrevia: {
        color: "#FFFFFF",
        fontSize: 15,
        marginBottom: 8
    },
    textoError: {
        color: "#FF8585",
        fontSize: 14,
        marginTop: 8
    }
});
