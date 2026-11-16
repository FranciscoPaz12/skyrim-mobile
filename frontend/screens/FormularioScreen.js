
//Importa React y la funcion para administrar los estados del formulario
import { useState } from "react";

//Importa los componentes necesarios para construir el formulario
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform
} from "react-native";

//Define la direccion de nuestra API de Node.js
const API_URL = "http://localhost:3000";

//Define el formulario para crear o modificar ingredientes
export default function FormularioScreen({ navigation, route }) {
    //Obtiene el ingrediente seleccionado o null cuando se crea uno nuevo
    const ingrediente = route.params?.ingrediente ?? null;

    //Determina si el formulario esta en modo edicion
    const editando = ingrediente !== null;
    //Almacena el nombre del ingrediente

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

    //Valida y envia el nuevo ingrediente a la API
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
            //Activa el indicador de carga y limpia los mensajes anteriores
            setCargando(true);
            setMensaje("");


            //Selecciona la ruta de actualizacion o creacion segun el formulario
            const url = editando
                ? `${API_URL}/api/ingredientes/${ingrediente.ID}`
                : `${API_URL}/api/ingredientes`;

            //Utiliza PUT para modificar y POST para crear ingredientes
            const metodo = editando ? "PUT" : "POST";

            //Envia los datos a la API utilizando la operacion correspondiente
            const respuesta = await fetch(url, {
                method: metodo,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    Nombre: nombre.trim(),
                    Efecto1: efecto1.trim(),
                    Efecto2: efecto2.trim(),
                    Efecto3: efecto3.trim(),
                    Efecto4: efecto4.trim(),
                    Calidad: calidadNumero
                })
            });

            //Convierte la respuesta del servidor a un objeto JavaScript
            const datos = await respuesta.json();

            //Comprueba si el servidor rechazo la solicitud
            if (!respuesta.ok) {
                setMensaje(datos.error || "No se pudo guardar el ingrediente");
                return;
            }

            //Regresa al listado despues de guardar correctamente
            navigation.goBack();

        } catch (errorConexion) {
            //Informa cuando no se puede conectar con el backend
            setMensaje("No se pudo conectar con el servidor");
        } finally {
            //Desactiva el indicador de carga
            setCargando(false);
        }
    }

    //Construye el formulario visual para registrar ingredientes
    return (
        <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}>

        <ScrollView
            style={styles.contenedor}
            contentContainerStyle={styles.contenido}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
        >
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

//Define los estilos visuales del formulario
const styles = StyleSheet.create({
    //Configura el fondo principal
    contenedor: {
        flex: 1,
        backgroundColor: "#161A1D"
    },

    //Configura los espacios internos del formulario
    contenido: {
        padding: 24,
        paddingBottom: 40
    },

    //Configura el titulo del formulario
    titulo: {
        color: "#D8C29D",
        fontSize: 26,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 28
    },

    //Configura las etiquetas de los campos
    etiqueta: {
        color: "#D8C29D",
        fontSize: 15,
        marginBottom: 8
    },

    //Configura las entradas de texto
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

    //Organiza horizontalmente los botones de calidad
    filaCalidad: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24
    },

    //Configura cada opcion de calidad
    botonCalidad: {
        flex: 1,
        backgroundColor: "#292F33",
        borderWidth: 1,
        borderColor: "#665A45",
        borderRadius: 6,
        padding: 14,
        alignItems: "center"
    },

    //Resalta la calidad seleccionada
    calidadActiva: {
        backgroundColor: "#806A43",
        borderColor: "#D8C29D"
    },

    //Configura el texto de las opciones de calidad
    textoCalidad: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold"
    },

    //Configura los mensajes de error
    error: {
        color: "#FF8585",
        textAlign: "center",
        marginBottom: 16
    },

    //Configura el boton para guardar ingredientes
    botonGuardar: {
        backgroundColor: "#806A43",
        borderRadius: 6,
        padding: 16,
        alignItems: "center"
    },

    //Configura el texto del boton principal
    textoBoton: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold"
    }
});
