import React, { useCallback, useState } from "react";
import { NavigationContainer, useFocusEffect } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Icon } from "react-native-elements";
import Login from "../screens/Account/Login";
import UserLogin from "./UserLogin/stacks/StackLogin";

//import Channels from "../screens/Channels";
//<Tab.Screen
//            name="channel"
//            component={Channels}
//            options={{title:"Canales"}}
//        />
import Library from "../screens/Library";
import Search from "../screens/Explorar/Search";

import SearchStack from "./SearchStack";
import AccountStack from "./AccountStack";
import PodcastStack from "./PodcastStack";
import Podcast from "../screens/Podcast/Podcast";
import Canales from "../screens/Podcast/Canales";
import Categorias from "../screens/Podcast/Categorias";
import Intereses from "../screens/Explorar/Intereses";
import TodosCanales from "../screens/Podcast/TodosCanales";
import SelectorIdioma from "../screens/Settings/SelectorIdioma";
import SelectorIntereses from "../screens/Settings/SelectorIntereses";
import SelectorInteresesAccount from "../screens/Settings/SelectorInteresesAccount";
import SelectorEspecies from "../screens/Settings/SelectorEspecies";
import SelectorDetallesEspecies from "../screens/Settings/SelectorDetallesEspecies";
import lang from "../utils/language";
import editProfile from "../screens/Settings/EditProfile";
import PlayerStack from "./PlayerStack";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-elements";
import PlayerWidget from "../components/PlayerWidget/Player";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ModalPlayer from "../components/ModalPlayer";
import { View } from "react-native";
import playPodcast from "../utils/playsong";

const StackNative = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="log">
        <Stack.Screen
          name="inicio"
          component={CoreApp}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="log"
          component={UserLogin}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="player-widget"
          component={PlayerWidget}
          options={{ contentStyle: { height: 200 } }}
        />
        <Stack.Screen name="podcast" component={Podcast} />
        <Stack.Screen name="canales" component={Canales} />
        <Stack.Screen name="categorias" component={Categorias} />
        <Stack.Screen name="intereses" component={Intereses} />

        <Stack.Screen
          name="edit-profile"
          component={editProfile}
          options={{
            title: "Editar tu perfil de usuario",
            //presentation: "modal",
            headerMode: "float",
          }}
        />
        <Stack.Screen
          name="select-intereses"
          component={SelectorIntereses}
          options={{
            title: "Select 5 interest",
            //presentation: "modal",
            headerMode: "float",
          }}
        />
        <Stack.Screen
          name="select-intereses-account"
          component={SelectorInteresesAccount}
          options={{
            title: "Cambiar intereses",
            //presentation: "modal",
            headerMode: "float",
          }}
        />
        <Stack.Screen
          name="select-especies"
          component={SelectorEspecies}
          options={{
            title: "Selección de Espécies",
            //presentation: "modal",
            headerMode: "float",
          }}
        />
        <Stack.Screen
          name="select-detalles-especies"
          component={SelectorDetallesEspecies}
          options={{
            title: "Selección Detalles Espécies",
            //presentation: "modal",
            headerMode: "float",
          }}
        />
        <Stack.Screen
          name="select-language"
          component={SelectorIdioma}
          options={{
            title: "Select your language",
            //presentation: "modal",
            headerMode: "float",
          }}
        />
      </Stack.Navigator>
      <PlayerWidget />
    </NavigationContainer>
  );
}

function CoreApp() {
  const [language, setLanguage] = useState(lang.idioma);

  useFocusEffect(
    useCallback(() => {
      setLanguage(lang.idioma);
    }, [lang])
  );

  return (
    <Tab.Navigator
      initialRouteName="home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => screenOptions(route, color),

        tabBarActiveTintColor: "#beff17",
        tabBarInactiveTintColor: "#ffffff",
        tabBarActiveBackgroundColor: "#594079",
        tabBarInactiveBackgroundColor: "#594079",
        tabBarLabelStyle: {
          fontSize: 12,
          paddingBottom: 15,
          fontWeight: "bold",
        },
        tabBarStyle: { height: 75, borderTopWidth: 0 },
        tabBarItemStyle: { height: 75, borderTopWidth: 0 },
      })}
    >
      <Tab.Screen
        name="home"
        component={PodcastStack}
        options={{ title: "Inicio", headerShown: false }}
      />
      <Tab.Screen
        name="search"
        component={SearchStack}
        options={{
          title: language == "es" ? "Explorar" : "Pesquisar",
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="library"
        component={Library}
        options={{ title: "Biblioteca", headerShown: false }}
        initialParams={{ idUser: "", nombre: "", foto: "", idioma: "es" }}
      />

      <Tab.Screen
        name="account"
        component={AccountStack}
        options={{
          title: language === "es" ? "Mi AgriFM" : "Minha AgriFM",
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

function screenOptions(route, color) {
  let iconName;

  switch (route.name) {
    case "home":
      iconName = "home-circle";

      break;
    case "search":
      iconName = "magnify";

      break;
    case "library":
      iconName = "playlist-play";

      break;
    case "channel":
      iconName = "view-list";

      break;
    case "account":
      iconName = "account-circle";

      break;
    default:
      break;
  }
  return (
    <Icon type="material-community" name={iconName} size={35} color={color} />
  );
}
