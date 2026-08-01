import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Search from "../screens/Explorar/Search";
import Intereses from "../screens/Explorar/Intereses";

const Stack = createStackNavigator();

export default function SearchStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="explorar"
        component={Search}
        options={{ headerShown: false }}
        initialParams={{ idUser: "", nombre: "", image: "", idioma: "es" }}
      />
    </Stack.Navigator>
  );
}
