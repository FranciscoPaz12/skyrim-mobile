
import { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    StyleSheet
} from "react-native";

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

    //Obtiene los ingredientes registrados en la base de datos
    useEffect(() => {
        async function cargarIngredientes() {
            try {
                const respuesta = await fetch(`${API_URL}/api/ingredientes`);

                if (!respuesta.ok) {
                    throw new Error("No se pudieron obtener los ingredientes");
                }

                const datos = await respuesta.json();
                setIngredientes(datos);
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

            //Selecciona el endpoint segun la operacion
            const url = esEdicion
                ? `${API_URL}/api/pociones/${pocionEditar.ID}`
                : `${API_URL}/api/pociones`;

            const respuesta = await fetch(url, {
                method: esEdicion ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    Nombre: nombre.trim(),
                    Ingrediente1ID: ingrediente1,
                    Ingrediente2ID: ingrediente2
                })
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                Alert.alert(
                    esEdicion ? "No se pudo editar la pocion" : "No se pudo crear la pocion",
                    datos.error || datos.mensaje || "Verifica los ingredientes seleccionados"
                );
                return;
            }

            Alert.alert(
                "Exito",
                esEdicion ? "Pocion actualizada correctamente" : "Pocion creada correctamente"
            );

            navigation.navigate("Pociones");

        } catch (error) {
            Alert.alert("Error", "No se pudo conectar con el servidor");
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
    }
});
