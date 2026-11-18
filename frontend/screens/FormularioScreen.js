//Estados, referencias y efectos de React
import { useState, useRef, useEffect } from "react";

//Componentes de la interfaz
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Alert, KeyboardAvoidingView, Platform, Keyboard } from "react-native";

import axios from "axios";

//Direccion de la API en Render
const API_URL = "https://skyrim-mobile-api.onrender.com";

//Formulario para crear o editar ingredientes
export default function FormularioScreen({ navigation, route }) {
    //Recibe el ingrediente que se va a editar
    const ingrediente = route.params?.ingrediente ?? null;

    //Indica si estamos editando
    const editando = ingrediente !== null;


    //Almacena el nombre actual o el nombre del ingrediente seleccionado
    const [nombre, setNombre] = useState(ingrediente?.Nombre ?? "");

    //Almacena el primer efecto del ingrediente
    const [efecto1, setEfecto1] = useState(ingrediente?.Efecto1 ?? "");

    //Almacena el segundo efecto del ingrediente
    const [efecto2, setEfecto2] = useState(ingrediente?.Efecto2 ?? "");

    //Almacena el tercer efecto del ingrediente
    const [efecto3, setEfecto3] = useState(ingrediente?.Efecto3 ?? "");

    //Almacena el cuarto efecto del ingrediente
    const [efecto4, setEfecto4] = useState(ingrediente?.Efecto4 ?? "");

    //Almacena la calidad actual del ingrediente
    const [calidad, setCalidad] = useState(String(ingrediente?.Calidad ?? 1));

    //Controla si se esta guardando el ingrediente
    const [cargando, setCargando] = useState(false);

    //Almacena los mensajes de error o confirmacion
    const [mensaje, setMensaje] = useState("");
    //Guarda la referencia del formulario desplazable

    const scrollRef = useRef(null);

    //Almacena la altura del teclado cuando aparece
    const [alturaTeclado, setAlturaTeclado] = useState(0);

    //Detecta cuando aparece o desaparece el teclado
    useEffect(() => {
        const mostrar = Keyboard.addListener("keyboardDidShow", (evento) => {
            setAlturaTeclado(evento.endCoordinates.height);
        });

        const ocultar = Keyboard.addListener("keyboardDidHide", () => {
            setAlturaTeclado(0);
        });

        return () => {
            mostrar.remove();
            ocultar.remove();
        };
    }, []);

    //Valida y guarda el ingrediente
    async function guardarIngrediente() {
        //Comprueba que todos los campos de texto esten completos
        if (![nombre, efecto1, efecto2, efecto3, efecto4].every(
            valor => valor.trim()
        )) {
            setMensaje("Completa todos los campos");
            return;
        }

        //Convierte la calidad seleccionada a un numero
        const calidadNumero = Number(calidad);

        //Comprueba que la calidad sea un entero entre 1 y 3
        if (!Number.isInteger(calidadNumero) ||
            calidadNumero < 1 ||
            calidadNumero > 3) {
            setMensaje("La calidad debe ser 1, 2 o 3");
            return;
        }

        try {

            setCargando(true);
            setMensaje("");

            //Prepara los datos del ingrediente
            const datosIngrediente = {
                Nombre: nombre.trim(),
                Efecto1: efecto1.trim(),
                Efecto2: efecto2.trim(),
                Efecto3: efecto3.trim(),
                Efecto4: efecto4.trim(),
                Calidad: calidadNumero
            };

            //Elige la ruta segun si crea o edita
            const url = editando
                ? `${API_URL}/api/ingredientes/${ingrediente.ID}`
                : `${API_URL}/api/ingredientes`;

            //Envia los datos con Axios
            if (editando) {
                await axios.put(url, datosIngrediente);
            } else {
                await axios.post(url, datosIngrediente);
            }

            //Regresa al listado despues de guardar correctamente
            navigation.goBack();

        } catch (errorConexion) {
            //Recupera el mensaje de error enviado por el backend
            if (errorConexion.response) {
                const datos = errorConexion.response.data;

                setMensaje(
                    datos?.error ||
                    datos?.mensaje ||
                    "No se pudo guardar el ingrediente"
                );
            } else {
                setMensaje("No se pudo conectar con el servidor");
            }
        } finally {

            setCargando(false);
        }
    }


    //Muestra el formulario en pantalla
    return (
        <KeyboardAvoidingView
            style={styles.contenedor}
            behavior={Platform.OS === "ios" ? "padding" : undefined}>

        <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={[
                styles.contenido,
                { paddingBottom: alturaTeclado + 100 }
            ]}
            keyboardShouldPersistTaps="handled"
        >
        <TouchableOpacity
            style={styles.botonNavegacion}
            onPress={() => navigation.navigate("Ingredientes")}
        >
            <Text style={styles.textoNavegacion}>VER INGREDIENTES</Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={styles.botonNavegacion}
            onPress={() => navigation.navigate("Pociones")}
        >
            <Text style={styles.textoNavegacion}>VER POCIONES</Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={styles.botonNavegacion}
            onPress={() => navigation.navigate("FormularioPocion")}
        >
            <Text style={styles.textoNavegacion}>CREAR POCION</Text>
        </TouchableOpacity>

            <Text style={styles.titulo}>
                {editando ? "EDITAR INGREDIENTE" : "NUEVO INGREDIENTE"}
            </Text>

            <Text style={styles.etiqueta}>Nombre</Text>
            <TextInput
                style={styles.entrada}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Nombre del ingrediente"
                placeholderTextColor="#999999"
            />

            <Text style={styles.etiqueta}>Efecto 1</Text>
            <TextInput
                style={styles.entrada}
                value={efecto1}
                onChangeText={setEfecto1}
                placeholder="Primer efecto"
                placeholderTextColor="#999999"
            />

            <Text style={styles.etiqueta}>Efecto 2</Text>
            <TextInput
                style={styles.entrada}
                value={efecto2}
                onChangeText={setEfecto2}
                placeholder="Segundo efecto"
                placeholderTextColor="#999999"
            />

            <Text style={styles.etiqueta}>Efecto 3</Text>
            <TextInput
                style={styles.entrada}
                value={efecto3}
                onChangeText={setEfecto3}
                placeholder="Tercer efecto"
                placeholderTextColor="#999999"
            />

            <Text style={styles.etiqueta}>Efecto 4</Text>
            <TextInput
                style={styles.entrada}
                value={efecto4}
                onChangeText={setEfecto4}
                placeholder="Cuarto efecto"
                placeholderTextColor="#999999"
            />

            <Text style={styles.etiqueta}>Calidad</Text>

            <View style={styles.filaCalidad}>
                {[1, 2, 3].map(numero => (
                    <TouchableOpacity
                        key={numero}
                        style={[
                            styles.botonCalidad,
                            calidad === String(numero) && styles.calidadActiva
                        ]}
                        onPress={() => setCalidad(String(numero))}
                    >
                        <Text style={styles.textoCalidad}>{numero}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {mensaje ? (
                <Text style={styles.error}>{mensaje}</Text>
            ) : null}

            <TouchableOpacity
                style={styles.botonGuardar}
                onPress={guardarIngrediente}
                disabled={cargando}
            >
                {cargando ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text style={styles.textoBoton}>
                        {editando ? "GUARDAR CAMBIOS" : "GUARDAR INGREDIENTE"}
                    </Text>
                )}
            </TouchableOpacity>
        </ScrollView>
        </KeyboardAvoidingView>
    );
}

//Estilos de la pantalla
const styles = StyleSheet.create({

    contenedor: {
        flex: 1,
        backgroundColor: "#161A1D"
    },


    contenido: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 100
    },


    titulo: {
        color: "#D8C29D",
        fontSize: 26,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 28
    },


    etiqueta: {
        color: "#D8C29D",
        fontSize: 15,
        marginBottom: 8
    },


    entrada: {
        backgroundColor: "#292F33",
        borderWidth: 1,
        borderColor: "#665A45",
        borderRadius: 6,
        padding: 14,
        color: "#FFFFFF",
        fontSize: 16,
        marginBottom: 18
    },


    filaCalidad: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24
    },


    botonCalidad: {
        flex: 1,
        backgroundColor: "#292F33",
        borderWidth: 1,
        borderColor: "#665A45",
        borderRadius: 6,
        padding: 14,
        alignItems: "center"
    },


    calidadActiva: {
        backgroundColor: "#806A43",
        borderColor: "#D8C29D"
    },


    textoCalidad: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold"
    },


    error: {
        color: "#FF8585",
        textAlign: "center",
        marginBottom: 16
    },


    botonGuardar: {
        backgroundColor: "#806A43",
        borderRadius: 6,
        padding: 16,
        alignItems: "center"
    },


    textoBoton: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold"
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

    textoNavegacion: {
        color: "#D8C29D",
        fontSize: 14,
        fontWeight: "bold"
},
});
