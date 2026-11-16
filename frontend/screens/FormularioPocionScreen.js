
 //Importa los componentes necesarios para mostrar el formulario
import { View, Text, StyleSheet } from "react-native";

//Define la pantalla para crear y editar pociones
export default function FormularioPocionScreen() {
    return (
        <View style={styles.contenedor}>
            <Text style={styles.titulo}>GESTIONAR POCION</Text>
        </View>
    );
}

//Define los estilos del formulario
const styles = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: "#161A1D",
        padding: 20
    },
    titulo: {
        color: "#D8C29D",
        fontSize: 26,
        fontWeight: "bold",
        textAlign: "center"
    }
});
