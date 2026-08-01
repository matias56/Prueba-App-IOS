import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import Login from "../screens/Account/Login";
import Register from "../screens/Account/Register";
import Email from "../screens/Account/Email";
import Idioma from "../screens/Account/Idioma";

const Stack = createStackNavigator();

export default function UserLogin() {
  return (
    <Stack.Navigator initialRouteName="idioma">
      <Stack.Screen
        name="idioma"
        component={Idioma}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="login"
        component={Login}
        options={{ title: "Iniciar sesión" }}
      />
      <Stack.Screen
        name="register"
        component={Register}
        options={{ title: "Registro" }}
      />
    </Stack.Navigator>
  );
}
