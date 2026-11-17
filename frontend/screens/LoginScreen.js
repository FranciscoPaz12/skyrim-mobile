//Importa React y el estado necesario para almacenar los datos del formulario
import { useState } from "react";

//Importa los componentes visuales y las herramientas para controlar el teclado
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, ScrollView, Keyboard, Platform } from "react-native";

import axios from "axios";

//Define la direccion publica del backend alojado en Render
const API_URL = "https://skyrim-mobile-api.onrender.com";

//Define la pantalla de inicio de sesion
export default function LoginScreen({ navigation }) {
    //Almacena el nombre de usuario ingresado
    const [usuario, setUsuario] = useState("");

    //Almacena la contraseña ingresada
    const [password, setPassword] = useState("");

    //Indica si estamos esperando la respuesta del servidor
    const [cargando, setCargando] = useState(false);

    //Almacena el mensaje de error que se mostrara en pantalla
    const [error, setError] = useState("");

    //Valida las credenciales ingresadas mediante nuestra API
    async function iniciarSesion() {
        //Comprueba que ambos campos tengan contenido
        if (!usuario.trim() || !password) {
            setError("Completa el usuario y la contraseña");
            return;
        }

        //Cierra el teclado antes de realizar la solicitud
        Keyboard.dismiss();

        try {
            //Activa el indicador de carga y limpia los errores anteriores
            setCargando(true);
            setError("");

            //Envia las credenciales al backend utilizando Axios
            await axios.post(`${API_URL}/api/login`, {
                usuario: usuario.trim(),
                password: password
            });

            //Abre la pantalla de ingredientes cuando el login es correcto
            navigation.replace("Ingredientes");

        } catch (errorConexion) {
            //Comprueba si el backend devolvio un error
            if (errorConexion.response) {
                const datos = errorConexion.response.data;

                //Muestra el mensaje enviado por el servidor
                setError(datos?.error || "No se pudo iniciar sesion");
            } else {
                //Informa cuando no se puede conectar con el servidor
                setError("No se pudo conectar con el servidor");
            }
        } finally {
            //Desactiva el indicador de carga al terminar la solicitud
            setCargando(false);
        }
    }


    //Construye los elementos visuales de la pantalla
    return (
        <KeyboardAvoidingView
            style={styles.contenedor}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                contentContainerStyle={styles.contenido}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
            >
                <View style={styles.formulario}>
                    <Text style={styles.titulo}>SKYRIM</Text>
                    <Text style={styles.subtitulo}>Gestor de Alquimia</Text>

                    <Text style={styles.etiqueta}>Usuario</Text>

                    <TextInput
                        style={styles.entrada}
                        placeholder="Ingresa tu usuario"
                        placeholderTextColor="#A0A0A0"
                        value={usuario}
                        onChangeText={setUsuario}
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="next"
                    />

                    <Text style={styles.etiqueta}>Contraseña</Text>

                    <TextInput
                        style={styles.entrada}
                        placeholder="Ingresa tu contraseña"
                        placeholderTextColor="#A0A0A0"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        returnKeyType="done"
                        onSubmitEditing={iniciarSesion}
                    />

                    {error ? (
                        <Text style={styles.error}>{error}</Text>
                    ) : null}

                    <TouchableOpacity
                        style={styles.boton}
                        onPress={iniciarSesion}
                        disabled={cargando}
                    >
                        {cargando ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.textoBoton}>INICIAR SESION</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

//Define los estilos visuales utilizados en la pantalla
const styles = StyleSheet.create({
    //Configura el fondo general de la pantalla
    contenedor: {
        flex: 1,
        backgroundColor: "#161A1D"
    },

    //Permite desplazar el contenido y mantenerlo centrado cuando hay espacio
    contenido: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 24
    },

    //Agrupa los elementos del formulario
    formulario: {
        width: "100%"
    },

    //Configura el titulo principal de Skyrim
    titulo: {
        fontSize: 38,
        fontWeight: "bold",
        color: "#D8C29D",
        textAlign: "center",
        letterSpacing: 5
    },

    //Configura el subtitulo de la aplicacion
    subtitulo: {
        fontSize: 18,
        color: "#C8C8C8",
        textAlign: "center",
        marginBottom: 40
    },

    //Configura las etiquetas de los campos
    etiqueta: {
        color: "#D8C29D",
        fontSize: 15,
        marginBottom: 8
    },

    //Configura las entradas de usuario y contraseña
    entrada: {
        backgroundColor: "#292F33",
        borderWidth: 1,
        borderColor: "#665A45",
        borderRadius: 6,
        padding: 14,
        color: "#FFFFFF",
        fontSize: 16,
        marginBottom: 20
    },

    //Configura el mensaje de error
    error: {
        color: "#FF8585",
        marginBottom: 16,
        textAlign: "center"
    },

    //Configura el boton para iniciar sesion
    boton: {
        backgroundColor: "#806A43",
        padding: 16,
        borderRadius: 6,
        alignItems: "center"
    },

    //Configura el texto del boton
    textoBoton: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold"
    }
});

