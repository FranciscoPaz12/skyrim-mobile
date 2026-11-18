import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, ScrollView, Keyboard, Platform } from "react-native";
import axios from "axios";

//Direccion del backend en Render
const API_URL = "https://skyrim-mobile-api.onrender.com";

//Pantalla de inicio de sesion
export default function LoginScreen({ navigation }) {
    //Guarda los datos ingresados y el estado de la solicitud
    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    //Valida los campos y consulta al backend
    async function iniciarSesion() {
        if (!usuario.trim() || !password) {
            setError("Completa el usuario y la contraseña");
            return;
        }

        Keyboard.dismiss();

        try {
            //Muestra la carga y borra errores anteriores
            setCargando(true);
            setError("");

            //Envia las credenciales a la API
            await axios.post(`${API_URL}/api/login`, {
                usuario: usuario.trim(),
                password: password
            });

            //Abre ingredientes si el inicio de sesion fue correcto
            navigation.replace("Ingredientes");

        } catch (errorConexion) {
            //Muestra errores del servidor o de conexion
            if (errorConexion.response) {
                const datos = errorConexion.response.data;
                setError(datos?.error || "No se pudo iniciar sesion");
            } else {
                setError("No se pudo conectar con el servidor");
            }
        } finally {
            //Oculta el indicador de carga
            setCargando(false);
        }
    }

    //Interfaz del formulario de inicio de sesion
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

//Estilos de la pantalla
const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: "#161A1D"
    },
    contenido: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 24
    },
    formulario: {
        width: "100%"
    },
    titulo: {
        fontSize: 38,
        fontWeight: "bold",
        color: "#D8C29D",
        textAlign: "center",
        letterSpacing: 5
    },
    subtitulo: {
        fontSize: 18,
        color: "#C8C8C8",
        textAlign: "center",
        marginBottom: 40
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
        marginBottom: 20
    },
    error: {
        color: "#FF8585",
        marginBottom: 16,
        textAlign: "center"
    },
    boton: {
        backgroundColor: "#806A43",
        padding: 16,
        borderRadius: 6,
        alignItems: "center"
    },
    textoBoton: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold"
    }
});
