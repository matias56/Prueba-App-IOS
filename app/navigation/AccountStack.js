import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Account from "../screens/Account/Account";
import Login from "../screens/Account/Login";
import Register from "../screens/Account/Register";
import UserLogged from "../screens/Account/UserLogged";

const Stack = createStackNavigator();

export default function AccountStack() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="cuenta"
        component={Account}
        options={{ title: "Crear Canal", headerShown: false }}
        initialParams={{ id: "", name: "", image: "" }}
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
      <Stack.Screen
        name="user"
        component={UserLogged}
        options={{ title: "Registro", headerShown: false }}
        initialParams={{ idUser: "", nombre: "", foto: "" }}
      />
    </Stack.Navigator>
  );
}
