
import { useEffect } from "react";
import { Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

//Importa las pantallas de la aplicacion
import LoginScreen from "./screens/LoginScreen";
import IngredientesScreen from "./screens/IngredientesScreen";
import FormularioScreen from "./screens/FormularioScreen";
import PocionesScreen from "./screens/PocionesScreen";
import FormularioPocionScreen from "./screens/FormularioPocionScreen";

//Crea el navegador entre pantallas
const Stack = createNativeStackNavigator();

//Componente principal de la aplicacion
export default function App() {

    //Oculta la barra inferior de Android al iniciar
    useEffect(() => {
        async function configurarBarra() {
            if (Platform.OS !== "android") {
                return;
            }

            try {
                await NavigationBar.setBehaviorAsync("overlay-swipe");
                await NavigationBar.setVisibilityAsync("hidden");
            } catch (error) {
                console.log("No se pudo ocultar la barra de navegacion");
            }
        }

        configurarBarra();
    }, []);

    //Configura las pantallas y sus nombres
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
