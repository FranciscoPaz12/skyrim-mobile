//Estados y funciones de React
import { useState, useCallback } from "react";

//Detecta cuando se vuelve a esta pantalla
import { useFocusEffect } from "@react-navigation/native";

import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, Keyboard } from "react-native";

import axios from "axios";

//Direccion de la API en Render
const API_URL = "https://skyrim-mobile-api.onrender.com";

//Pantalla de ingredientes
export default function IngredientesScreen({ navigation }) {

    //Lista de ingredientes recibidos
    const [ingredientes, setIngredientes] = useState([]);

    //Texto del buscador
    const [busqueda, setBusqueda] = useState("");

    //Estado de carga
    const [cargando, setCargando] = useState(true);

    //Mensaje de error
    const [error, setError] = useState("");

    //Consulta los ingredientes y aplica la busqueda
    async function cargarIngredientes(textoBusqueda = "") {
        try {
            setCargando(true);
            setError("");

            const respuesta = await axios.get(`${API_URL}/api/ingredientes`, {
                params: {
                    buscar: textoBusqueda
                }
            });

            setIngredientes(respuesta.data);

        } catch (errorConexion) {
            setError("No se pudieron cargar los ingredientes");
        } finally {
            setCargando(false);
        }
    }

    //Elimina el ingrediente seleccionado
    async function eliminarIngrediente(id) {
        try {
            await axios.delete(`${API_URL}/api/ingredientes/${id}`);

            await cargarIngredientes(busqueda);

        } catch (errorConexion) {
            if (errorConexion.response) {
                const datos = errorConexion.response.data;

                Alert.alert(
                    "Error",
                    datos?.error || "No se pudo eliminar el ingrediente"
                );
            } else {
                Alert.alert("Error", "No se pudo conectar con el servidor");
            }
        }
    }

    //Pide confirmacion antes de eliminar
    function confirmarEliminacion(ingrediente) {
        const confirmar = () => eliminarIngrediente(ingrediente.ID);

        if (typeof window !== "undefined" && window.confirm) {
            if (window.confirm(`¿Eliminar ${ingrediente.Nombre}?`)) {
                confirmar();
            }
            return;
        }

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
            //Actualiza la lista al entrar a la pantalla
            cargarIngredientes();
        }, [])
    );

    //Interfaz de ingredientes
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
                                Calidad: {["", "I", "II", "III"][item.Calidad]}
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

//Estilos de la pantalla
    const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: "#161A1D",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 80
    },

    titulo: {
        color: "#D8C29D",
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8
    },

    subtitulo: {
        color: "#C8C8C8",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 20
    },
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

    botonBuscar: {
        backgroundColor: "#806A43",
        borderRadius: 6,
        padding: 12,
        alignItems: "center",
        marginBottom: 20
    },

    botonPociones: {
    backgroundColor: "#39434A",
    borderWidth: 1,
    borderColor: "#D8C29D",
    borderRadius: 6,
    padding: 16,
    alignItems: "center",
    marginBottom: 12
},

    textoBotonPociones: {
    color: "#D8C29D",
    fontSize: 16,
    fontWeight: "bold"
},

    botonEditar: {
        backgroundColor: "#665A45",
        borderRadius: 6,
        padding: 12,
        alignItems: "center",
        marginTop: 12
    },


    botonEliminar: {
        backgroundColor: "#653333",
        borderWidth: 1,
        borderColor: "#B76E6E",
        borderRadius: 6,
        padding: 12,
        alignItems: "center",
        marginTop: 10
    },


    tarjeta: {
        backgroundColor: "#292F33",
        borderWidth: 1,
        borderColor: "#665A45",
        borderRadius: 8,
        padding: 16,
        marginBottom: 12
    },

    nombre: {
        color: "#D8C29D",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8
    },

    detalle: {
        color: "#E0E0E0",
        fontSize: 14,
        marginBottom: 4
    },

    error: {
        color: "#FF8585",
        textAlign: "center",
        marginTop: 20
    },

    vacio: {
        color: "#C8C8C8",
        textAlign: "center",
        marginTop: 20
    },

    boton: {
        backgroundColor: "#806A43",
        borderRadius: 6,
        padding: 16,
        alignItems: "center",
        marginTop: 12
    },

    textoBoton: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "bold"
    },
    textoBotonEliminar: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "bold"
    },
    });
