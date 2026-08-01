import React, { useState, useEffect, useCallback } from "react";
import { LogBox } from "react-native"; //SOLUCION AL WARNING DEL TIMER PRODUCIDO POR FIREBASE
import Navigation from "./app/navigation/Navigation";
import PlayerWidget from "./app/components/PlayerWidget/Player";
//import FirstLogin from "./app/firstLogin/stacks/StackLogin";
//import initialState from "./app/utils/user";
import { NavigationContainer, useFocusEffect } from "@react-navigation/native";
import { decode, encode } from "base-64";
import { RootSiblingParent } from "react-native-root-siblings";
import playPodcast from "./app/utils/playsong";
import { View } from "react-native-web";
import NoPlayer from "./app/components/PlayerWidget/NoPlayer";
import { ThemeProvider } from 'react-native-elements';
import { SafeAreaProvider } from 'react-native-safe-area-context';


if (!global.btoa) global.btoa = encode;
if (!global.atob) global.atob = decode;

LogBox.ignoreLogs(["Unhandled promise rejection:"]); //POR AHORA SOLO SE SOLUCIONA ASI Y SIEMPRE PASA EN EL DESARROLO EN REACT-NATIVE
//usa las tres primeras palabras para seleccionar el warning

export default function App(props) {
  //const [widgetplay, setWidgetplay] = useState(playPodcast.podcast);

  //useEffect(() => {
  //  setWidgetplay(playPodcast.podcast);
  //}, [playPodcast.podcast]);

  //initialState.default.isAuthorized = true;
  const Wrapper = Platform.OS === "ios" ? React.Fragment : RootSiblingParent;
  //const { nuevoPodcast } = props;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Wrapper>
          <Navigation />

          {/*<NavigationContainer>
        <PlayerWidget />
      </NavigationContainer>*/}
        </Wrapper>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
