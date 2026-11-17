//Importa React y las funciones necesarias para administrar los estados
import { useState, useCallback } from "react";

//Importa el hook que detecta cuando una pantalla recibe el foco
import { useFocusEffect } from "@react-navigation/native";

import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Alert,
    Keyboard
} from "react-native";

//Define la direccion publica del backend alojado en Render
const API_URL = "https://skyrim-mobile-api.onrender.com";

//Define la pantalla que muestra los ingredientes registrados
export default function IngredientesScreen({ navigation }) {

    //Almacena los ingredientes obtenidos desde la base de datos
    const [ingredientes, setIngredientes] = useState([]);

    //Almacena el texto utilizado para buscar ingredientes
    const [busqueda, setBusqueda] = useState("");

    //Indica si se estan cargando los ingredientes
    const [cargando, setCargando] = useState(true);

    //Almacena los mensajes de error
    const [error, setError] = useState("");

    //Consulta los ingredientes registrados y permite filtrarlos por nombre
    async function cargarIngredientes(textoBusqueda = "") {

        try {
            //Activa la carga y limpia los errores anteriores
            setCargando(true);
            setError("");

            //Codifica el texto para enviarlo correctamente en la URL
            const textoCodificado = encodeURIComponent(textoBusqueda);

            //Consulta los ingredientes utilizando el filtro del backend
            const respuesta = await fetch(
                `${API_URL}/api/ingredientes?buscar=${textoCodificado}`
            );

            //Comprueba si la solicitud fue exitosa
            if (!respuesta.ok) {
                throw new Error("No se pudieron obtener los ingredientes");
            }

            //Convierte la respuesta JSON en un arreglo
            const datos = await respuesta.json();

            //Actualiza la lista con los ingredientes recibidos
            setIngredientes(datos);
        } catch (errorConexion) {
            //Muestra un mensaje si falla la consulta
            setError("No se pudieron cargar los ingredientes");
        } finally {
            //Finaliza el estado de carga
            setCargando(false);
        }
}

//Elimina un ingrediente de la base de datos mediante su ID
async function eliminarIngrediente(id) {
    try {
        //Envia una solicitud DELETE al backend
        const respuesta = await fetch(`${API_URL}/api/ingredientes/${id}`, {
            method: "DELETE"
        });

        //Convierte la respuesta del servidor a un objeto JavaScript
        const datos = await respuesta.json();

        //Comprueba si el servidor rechazo la eliminacion
        if (!respuesta.ok) {
            Alert.alert("Error", datos.error || "No se pudo eliminar el ingrediente");
            return;
        }

        //Actualiza el listado despues de eliminar el ingrediente
        await cargarIngredientes(busqueda);
    } catch (errorConexion) {
        //Informa cuando no se puede completar la solicitud
        Alert.alert("Error", "No se pudo conectar con el servidor");
    }
}

    //Solicita confirmacion antes de eliminar un ingrediente
    function confirmarEliminacion(ingrediente) {
        //Muestra una confirmacion para evitar eliminaciones accidentales
        const confirmar = () => eliminarIngrediente(ingrediente.ID);

        //Utiliza la confirmacion del navegador cuando ejecutamos Expo Web
        if (typeof window !== "undefined" && window.confirm) {
            if (window.confirm(`¿Eliminar ${ingrediente.Nombre}?`)) {
                confirmar();
            }
            return;
        }

        //Utiliza el cuadro de confirmacion nativo en Android
        Alert.alert(
            "Eliminar ingrediente",
            `¿Seguro que queres eliminar ${ingrediente.Nombre}?`,
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Eliminar", style: "destructive", onPress: confirmar }
            ]
        );
    }


    useFocusEffect(
        useCallback(() => {
            //Carga todos los ingredientes al ingresar a la pantalla
            cargarIngredientes();
        }, [])
    );

    //Construye la interfaz de la pantalla de ingredientes
    return (
        <View style={styles.contenedor}>
            <Text style={styles.titulo}>INGREDIENTES</Text>

            <Text style={styles.subtitulo}>
                Ingredientes registrados en Skyrim
            </Text>

            <TextInput
            style={styles.buscador}
            placeholder="Buscar ingrediente por nombre o efecto..."
            placeholderTextColor="#999999"
            value={busqueda}
            onChangeText={setBusqueda}
            onSubmitEditing={() => {
                Keyboard.dismiss();
                cargarIngredientes(busqueda);
            }}
            returnKeyType="search"
            />

            <TouchableOpacity
                style={styles.botonBuscar}
                onPress={() => {
                    Keyboard.dismiss();
                    cargarIngredientes(busqueda);
                }}
            >
                <Text style={styles.textoBoton}>BUSCAR</Text>
            </TouchableOpacity>
            {cargando ? (
                <ActivityIndicator size="large" color="#D8C29D" />
            ) : error ? (
                <Text style={styles.error}>{error}</Text>
            ) : (
                <FlatList
                    data={ingredientes}
                    keyExtractor={(item) => String(item.ID)}
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                        <Text style={styles.vacio}>
                            No hay ingredientes registrados
                        </Text>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.tarjeta}>
                            <Text style={styles.nombre}>{item.Nombre}</Text>

                            <Text style={styles.detalle}>
                                Calidad: {item.Calidad}
                            </Text>

                            <Text style={styles.detalle}>
                                Efecto 1: {item.Efecto1}
                            </Text>

                            <Text style={styles.detalle}>
                                Efecto 2: {item.Efecto2}
                            </Text>

                            <Text style={styles.detalle}>
                                Efecto 3: {item.Efecto3}
                            </Text>

                            <Text style={styles.detalle}>
                                Efecto 4: {item.Efecto4}
                            </Text>

                            <TouchableOpacity
                                style={styles.botonEditar}
                                onPress={() => navigation.navigate("Formulario", {
                                    ingrediente: item
                                })}
                            >
                            <Text style={styles.textoBoton}>EDITAR</Text>

                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.botonEliminar}
                                onPress={() => confirmarEliminacion(item)}
                            >
                                <Text style={styles.textoBotonEliminar}>ELIMINAR</Text>
                            </TouchableOpacity>

                        </View>
                    )}
                />
            )}

            <TouchableOpacity
                style={styles.botonPociones}
                onPress={() => navigation.navigate("Pociones")}
            >
                <Text style={styles.textoBotonPociones}>
                    VER POCIONES
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                    style={styles.botonPociones}
                    onPress={() => navigation.navigate("FormularioPocion")}
                >
                    <Text style={styles.textoBotonPociones}>
                        CREAR POCION
                    </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.botonPociones}
                onPress={() => navigation.navigate("Formulario")}
            >
                <Text style={styles.textoBotonPociones}>
                    AGREGAR INGREDIENTE
                </Text>
            </TouchableOpacity>
        </View>
    );
}

//Define los estilos visuales de la pantalla
    const styles = StyleSheet.create({
    //Configura el fondo y los espacios generales
    contenedor: {
        flex: 1,
        backgroundColor: "#161A1D",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 80
    },

    //Configura el titulo principal
    titulo: {
        color: "#D8C29D",
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8
    },

    //Configura el subtitulo
    subtitulo: {
        color: "#C8C8C8",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 20
    },
    //Configura el campo para buscar ingredientes
    buscador: {
        backgroundColor: "#292F33",
        borderWidth: 1,
        borderColor: "#665A45",
        borderRadius: 6,
        padding: 14,
        color: "#FFFFFF",
        fontSize: 15,
        marginBottom: 10
    },

    //Configura el boton para ejecutar la busqueda
    botonBuscar: {
        backgroundColor: "#806A43",
        borderRadius: 6,
        padding: 12,
        alignItems: "center",
        marginBottom: 20
    },

    //Define el estilo del boton para acceder a pociones
    botonPociones: {
    backgroundColor: "#39434A",
    borderWidth: 1,
    borderColor: "#D8C29D",
    borderRadius: 6,
    padding: 16,
    alignItems: "center",
    marginBottom: 12
},

    //Define el estilo del texto del boton de pociones
    textoBotonPociones: {
    color: "#D8C29D",
    fontSize: 16,
    fontWeight: "bold"
},

    //Configura el boton para editar un ingrediente existente
    botonEditar: {
        backgroundColor: "#665A45",
        borderRadius: 6,
        padding: 12,
        alignItems: "center",
        marginTop: 12
    },


    //Configura el boton para eliminar un ingrediente
    botonEliminar: {
        backgroundColor: "#653333",
        borderWidth: 1,
        borderColor: "#B76E6E",
        borderRadius: 6,
        padding: 12,
        alignItems: "center",
        marginTop: 10
    },


    //Configura las tarjetas de ingredientes
    tarjeta: {
        backgroundColor: "#292F33",
        borderWidth: 1,
        borderColor: "#665A45",
        borderRadius: 8,
        padding: 16,
        marginBottom: 12
    },

    //Configura el nombre de cada ingrediente
    nombre: {
        color: "#D8C29D",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8
    },

    //Configura la informacion de los ingredientes
    detalle: {
        color: "#E0E0E0",
        fontSize: 14,
        marginBottom: 4
    },

    //Configura los mensajes de error
    error: {
        color: "#FF8585",
        textAlign: "center",
        marginTop: 20
    },

    //Configura el mensaje cuando no existen ingredientes
    vacio: {
        color: "#C8C8C8",
        textAlign: "center",
        marginTop: 20
    },

    //Configura el boton para agregar ingredientes
    boton: {
        backgroundColor: "#806A43",
        borderRadius: 6,
        padding: 16,
        alignItems: "center",
        marginTop: 12
    },

    //Configura el texto del boton
    textoBoton: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "bold"
    },
        //Define el estilo del boton para eliminar ingredientes
    botonEliminar: {
        backgroundColor: "#653333",
        borderWidth: 1,
        borderColor: "#B76E6E",
        borderRadius: 6,
        padding: 12,
        alignItems: "center",
        marginTop: 10
    },
    //Define el estilo del texto del boton eliminar
    textoBotonEliminar: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "bold"
    },
    });
