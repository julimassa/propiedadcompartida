import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Iniciar sesión" }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Registro" }} />
    </Stack.Navigator>
  );
}
