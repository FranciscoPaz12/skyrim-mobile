
import { useState, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StyleSheet
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

//Direccion publica del backend
const API_URL = "https://skyrim-mobile-api.onrender.com";

//Define la pantalla que muestra las pociones registradas
export default function PocionesScreen() {
    const [pociones, setPociones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [mensaje, setMensaje] = useState("");

    //Consulta las pociones almacenadas en TiDB Cloud
    async function cargarPociones() {
        try {
            setCargando(true);
            setMensaje("");

            const respuesta = await fetch(`${API_URL}/api/pociones`);

            if (!respuesta.ok) {
                throw new Error("Error al consultar pociones");
            }

            const datos = await respuesta.json();
            setPociones(datos);

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
            </View>
        );
    }

    return (
        <View style={styles.contenedor}>
            <Text style={styles.titulo}>POCIONES</Text>

            {cargando ? (
                <ActivityIndicator size="large" color="#D8C29D" />
            ) : (
                <FlatList
                    data={pociones}
                    keyExtractor={item => String(item.ID)}
                    renderItem={mostrarPocion}
                    contentContainerStyle={styles.lista}
                    ListEmptyComponent={
                        <Text style={styles.mensaje}>
                            {mensaje || "No hay pociones registradas"}
                        </Text>
                    }
                />
            )}
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
    }
});
