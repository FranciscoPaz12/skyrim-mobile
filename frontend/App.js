
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

//Crea el navegador que permite cambiar entre las pantallas
const Stack = createNativeStackNavigator();

//Define el componente principal de Skyrim Mobile
export default function App() {
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
            </Stack.Navigator>
        </NavigationContainer>
    );
}
