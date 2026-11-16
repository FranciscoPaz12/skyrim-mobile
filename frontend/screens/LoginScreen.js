
//Importa React y el estado necesario para almacenar los datos del formulario
import { useState } from "react";

//Importa los componentes visuales utilizados en la pantalla de login
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator
} from "react-native";

//Define la direccion del backend que se ejecuta en la computadora
const API_URL = "http://localhost:3000";

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

        try {
            //Activa el indicador de carga y limpia los errores anteriores
            setCargando(true);
            setError("");

            //Envia las credenciales al backend mediante una solicitud POST
            const respuesta = await fetch(`${API_URL}/api/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    usuario: usuario.trim(),
                    password: password
                })
            });

            //Convierte la respuesta del servidor a un objeto JavaScript
            const datos = await respuesta.json();

            //Comprueba si el servidor rechazo las credenciales
            if (!respuesta.ok) {
                setError(datos.error || "No se pudo iniciar sesion");
                return;
            }

            //Abre la pantalla de ingredientes cuando el login es correcto
            navigation.replace("Ingredientes");

        } catch (errorConexion) {
            //Muestra un mensaje cuando no se puede conectar con el servidor
            setError("No se pudo conectar con el servidor");
        } finally {
            //Desactiva el indicador de carga al terminar la solicitud
            setCargando(false);
        }
    }

    //Construye los elementos visuales de la pantalla
    return (
        <View style={styles.contenedor}>
            <Text style={styles.titulo}>SKYRIM</Text>
            <Text style={styles.subtitulo}>Gestor de Alquimia</Text>

            <Text style={styles.etiqueta}>Usuario</Text>

            <TextInput
                style={styles.entrada}
                placeholder="Ingresa tu usuario"
                value={usuario}
                onChangeText={setUsuario}
                autoCapitalize="none"
            />

            <Text style={styles.etiqueta}>Contraseña</Text>

            <TextInput
                style={styles.entrada}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
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
    );
}

//Define los estilos visuales utilizados en la pantalla
const styles = StyleSheet.create({
    //Configura el fondo y la distribucion general del formulario
    contenedor: {
        flex: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#161A1D"
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
