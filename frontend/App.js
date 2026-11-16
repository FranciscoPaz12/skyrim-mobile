
 //Importa el efecto necesario para configurar la barra al iniciar la aplicacion
import { useEffect } from "react";

//Importa el sistema operativo para aplicar cambios solamente en Android
import { Platform } from "react-native";

//Importa las herramientas para controlar la barra inferior de Android
import * as NavigationBar from "expo-navigation-bar";

//Importa el contenedor que administra la navegacion de la aplicacion
import { NavigationContainer } from "@react-navigation/native";

//Importa el sistema de navegacion entre pantallas
import { createNativeStackNavigator } from "@react-navigation/native-stack";

//Importa la pantalla de inicio de sesion
import LoginScreen from "./screens/LoginScreen";

//Importa la pantalla que muestra los ingredientes
import IngredientesScreen from "./screens/IngredientesScreen";

//Importa la pantalla para agregar y modificar ingredientes
import FormularioScreen from "./screens/FormularioScreen";

//Importa la pantalla que muestra las pociones
import PocionesScreen from "./screens/PocionesScreen";

//Importa la pantalla para crear y modificar pociones
import FormularioPocionScreen from "./screens/FormularioPocionScreen";

//Crea el navegador que permite cambiar entre las pantallas
const Stack = createNativeStackNavigator();

//Define el componente principal de Skyrim Mobile
export default function App() {
    //Configura la barra de navegacion cuando se abre la aplicacion
    useEffect(() => {
        async function configurarBarra() {
            //Evita ejecutar funciones exclusivas de Android en otros sistemas
            if (Platform.OS !== "android") {
                return;
            }

            try {
                //Permite que la barra reaparezca temporalmente al deslizar desde el borde
                await NavigationBar.setBehaviorAsync("overlay-swipe");

                //Intenta ocultar la barra inferior del sistema
                await NavigationBar.setVisibilityAsync("hidden");
            } catch (error) {
                //Evita interrumpir la aplicacion si Expo Go no permite ocultarla
                console.log("No se pudo ocultar la barra de navegacion");
            }
        }

        configurarBarra();
    }, []);

    //Devuelve el contenedor de navegacion de la aplicacion
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ title: "Skyrim - Iniciar sesion" }}
                />

                <Stack.Screen
                    name="Ingredientes"
                    component={IngredientesScreen}
                    options={{ title: "Ingredientes" }}
                />

                <Stack.Screen
                    name="Formulario"
                    component={FormularioScreen}
                    options={{ title: "Gestionar ingrediente" }}
                />
                <Stack.Screen
                    name="Pociones"
                    component={PocionesScreen}
                    options={{ title: "Pociones" }}
                />

                <Stack.Screen
                    name="FormularioPocion"
                    component={FormularioPocionScreen}
                    options={{ title: "Gestionar pocion" }}
                />

            </Stack.Navigator>
        </NavigationContainer>
    );
}
