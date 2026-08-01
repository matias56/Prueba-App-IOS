import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import PlayerWidget from "../components/PlayerWidget/Player";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const Stack = createStackNavigator();

export default function PlayerStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="player" component={PlayerWidget} options={{}} />
    </Stack.Navigator>
  );
}
