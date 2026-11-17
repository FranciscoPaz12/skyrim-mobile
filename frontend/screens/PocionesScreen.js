import { useState, useCallback } from "react";
import { View, Text, TextInput, FlatList, ActivityIndicator, TouchableOpacity, Alert, Keyboard, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";

//Direccion publica del backend
const API_URL = "https://skyrim-mobile-api.onrender.com";

//Define la pantalla que muestra las pociones registradas
export default function PocionesScreen({ navigation }) {
    const [pociones, setPociones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [mensaje, setMensaje] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [filtro, setFiltro] = useState("");

    //Consulta las pociones almacenadas en TiDB Cloud
    async function cargarPociones() {
        try {
            setCargando(true);
            setMensaje("");

            //Obtiene las pociones desde la API mediante Axios
            const respuesta = await axios.get(`${API_URL}/api/pociones`);

            setPociones(respuesta.data);

        } catch (error) {
            setMensaje("No se pudieron cargar las pociones");
        } finally {
            setCargando(false);
        }
    }

    //Actualiza el listado cada vez que se abre la pantalla
    useFocusEffect(
        useCallback(() => {
            cargarPociones();
        }, [])
    );
    //Solicita confirmacion antes de eliminar una pocion
    function confirmarEliminarPocion(pocion) {
    Alert.alert(
        "Eliminar pocion",
        `¿Seguro que deseas eliminar "${pocion.Nombre}"?`,
        [
            {
                text: "CANCELAR",
                style: "cancel"
            },
            {
                text: "ELIMINAR",
                style: "destructive",
                onPress: () => eliminarPocion(pocion.ID)
            }
        ]
    );
}

    //Elimina la pocion de la base de datos
    async function eliminarPocion(id) {
        try {
            //Elimina la pocion seleccionada mediante Axios
            await axios.delete(`${API_URL}/api/pociones/${id}`);

            Alert.alert("Exito", "Pocion eliminada correctamente");

            //Actualiza el listado despues de eliminar
            await cargarPociones();

        } catch (error) {
            Alert.alert("Error", "No se pudo eliminar la pocion");
        }
    }
    //Aplica la busqueda cuando el usuario presiona el boton
    function buscarPociones() {
        Keyboard.dismiss();
        setFiltro(busqueda.trim().toLowerCase());
    }
    //Filtra las pociones por nombre, ingredientes o efectos
    const pocionesFiltradas = pociones.filter(pocion => {
        if (!filtro) return true;

        const datos = [
            pocion.Nombre,
            pocion.Ingrediente1,
            pocion.Ingrediente2,
            ...(pocion.Efectos || [])
        ];

        return datos.some(valor =>
            String(valor ?? "").toLowerCase().includes(filtro)
        );
    });

    //Muestra los datos de cada pocion
    function mostrarPocion({ item }) {
        return (
            <View style={styles.tarjeta}>
                <Text style={styles.nombre}>{item.Nombre}</Text>

                <Text style={styles.detalle}>
                    Ingredientes: {item.Ingrediente1} + {item.Ingrediente2}
                </Text>

                <Text style={styles.detalle}>
                    Magnitud: {["", "I", "II", "III"][item.Magnitud] ?? item.Magnitud}
                </Text>

                <Text style={styles.subtitulo}>Efectos:</Text>

                {item.Efectos.map((efecto, indice) => (
                    <Text key={indice} style={styles.efecto}>
                        • {efecto}
                    </Text>
                ))}

                <TouchableOpacity
                    style={styles.botonEditar}
                    onPress={() => navigation.navigate("FormularioPocion", {
                        pocion: item
                    })}
                >
                    <Text style={styles.textoBotonEditar}>
                        EDITAR
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                        style={styles.botonEliminar}
                        onPress={() => confirmarEliminarPocion(item)}
                >
                        <Text style={styles.textoBotonEliminar}>
                            ELIMINAR
                        </Text>
                </TouchableOpacity>

            </View>
        );
    }


    return (
        <View style={styles.contenedor}>

            {/*Titulo de la pantalla*/}
            <Text style={styles.titulo}>POCIONES</Text>

            {/*Campo para buscar pociones*/}
            <TextInput
                style={styles.buscador}
                placeholder="Buscar pocion, ingrediente o efecto..."
                placeholderTextColor="#999999"
                value={busqueda}
                onChangeText={setBusqueda}
                onSubmitEditing={() => Keyboard.dismiss()}
                returnKeyType="search"
            />

            {/*Boton que ejecuta la busqueda*/}
            <TouchableOpacity
                style={styles.botonBuscar}
                onPress={buscarPociones}
            >
                <Text style={styles.textoBoton}>BUSCAR</Text>
            </TouchableOpacity>

            {/*Listado de pociones registradas*/}
            {cargando ? (
                <ActivityIndicator size="large" color="#D8C29D" />
            ) : (
                <FlatList
                    data={pocionesFiltradas}
                    keyExtractor={item => String(item.ID)}
                    renderItem={mostrarPocion}
                    contentContainerStyle={styles.lista}
                    style={{ flex: 1 }}
                    ListEmptyComponent={
                        <Text style={styles.mensaje}>
                            {mensaje || "No hay pociones registradas"}
                        </Text>
                    }
                />
            )}

            {/*Boton para ver ingredientes*/}
            <TouchableOpacity
                style={styles.boton}
                onPress={() => navigation.navigate("Ingredientes")}
            >
                <Text style={styles.textoBoton}>
                    VER INGREDIENTES
                </Text>
            </TouchableOpacity>

            {/*Boton para crear ingredientes*/}
            <TouchableOpacity
                style={styles.boton}
                onPress={() => navigation.navigate("Formulario")}
            >
                <Text style={styles.textoBoton}>
                    CREAR INGREDIENTE
                </Text>
            </TouchableOpacity>

            {/*Boton para crear pociones*/}
            <TouchableOpacity
                style={styles.boton}
                onPress={() => navigation.navigate("FormularioPocion")}
            >
                <Text style={styles.textoBoton}>
                    CREAR POCION
                </Text>
            </TouchableOpacity>

        </View>
    );

}

//Define los estilos visuales de la pantalla
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
        fontSize: 26,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 24
    },
    lista: {
        paddingBottom: 20
    },
    tarjeta: {
        backgroundColor: "#292F33",
        borderWidth: 1,
        borderColor: "#665A45",
        borderRadius: 8,
        padding: 18,
        marginBottom: 14
    },
    nombre: {
        color: "#D8C29D",
        fontSize: 19,
        fontWeight: "bold",
        marginBottom: 12
    },
    detalle: {
        color: "#FFFFFF",
        fontSize: 15,
        marginBottom: 8
    },
    subtitulo: {
        color: "#D8C29D",
        fontSize: 15,
        fontWeight: "bold",
        marginTop: 8,
        marginBottom: 6
    },
    efecto: {
        color: "#FFFFFF",
        fontSize: 14,
        marginBottom: 4
    },
    mensaje: {
        color: "#FFFFFF",
        textAlign: "center",
        marginTop: 30
    },
    boton: {
        backgroundColor: "#39434A",
        borderWidth: 1,
        borderColor: "#D8C29D",
        borderRadius: 6,
        padding: 14,
        alignItems: "center",
        marginBottom: 12
    },
    textoBoton: {
        color: "#D8C29D",
        fontSize: 16,
        fontWeight: "bold"
    },
    botonEditar: {
        backgroundColor: "#39434A",
        borderWidth: 1,
        borderColor: "#D8C29D",
        borderRadius: 6,
        padding: 12,
        alignItems: "center",
        marginTop: 14
    },
    textoBotonEditar: {
        color: "#D8C29D",
        fontSize: 14,
        fontWeight: "bold"
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
    textoBotonEliminar: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "bold"
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
});
