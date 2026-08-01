import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Home from "../screens/Podcast/Home";
import Podcast from "../screens/Podcast/Podcast";
import Canales from "../screens/Podcast/Canales";
import TodosCanales from "../screens/Podcast/TodosCanales";

const Stack = createStackNavigator();

export default function PodcastStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="inicio"
        component={Home}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="todos-canales"
        component={TodosCanales}
        options={{ title: "Todos los canales" }}
      />
    </Stack.Navigator>
  );
}
