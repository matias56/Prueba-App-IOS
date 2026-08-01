import React, { useRef, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  DeviceEventEmitter,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import lang from "../../utils/language";
import { Icon, Avatar, Image, Input, Divider } from "react-native-elements";
import Toast from "react-native-root-toast";

export default function SelectorIdioma() {
  const toastRef = useRef();
  const navigation = useNavigation();
  const [language, setLanguage] = useState(lang.idioma);

  useFocusEffect(
    useCallback(() => {
      setLanguage(lang.idioma);
    }, [lang])
  );

  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <Avatar
        size="large"
        source={require("../../../assets/img/flag-brazil.png")}
        rounded
        onPress={() => {
          lang.idioma = "pt-br";
          DeviceEventEmitter.emit("idioma", {
            idioma: "pt-br",
          });
          navigation.navigate("inicio");
        }}
        activeOpacity={0.7}
        containerStyle={{
          //flex: 1,
          //marginRight: 20,
          //marginTop: -60,
          //marginBottom: 20,
          alignSelf: "center",
        }}
      />
      <Divider style={styles.divider} />
      <Avatar
        size="large"
        source={require("../../../assets/img/flag-spain.png")}
        rounded
        onPress={() => {
          lang.idioma = "es";
          DeviceEventEmitter.emit("idioma", {
            idioma: "es",
          });
          navigation.navigate("inicio");
        }}
        activeOpacity={0.7}
        containerStyle={{
          //flex: 1,
          //marginRight: 20,
          marginTop: 20,
          //marginBottom: 20,
          alignSelf: "center",
        }}
      />
      <Divider style={styles.divider} />
      <Avatar
        size="large"
        source={require("../../../assets/img/flag-uk.png")}
        rounded
        onPress={() => {
          Toast.show(
            language === "es"
              ? "Esta opción aún no está disponible"
              : "Esta opção ainda não está disponível",
            {
              position: Toast.positions.CENTER,
            }
          );
        }}
        activeOpacity={0.7}
        containerStyle={{
          //flex: 1,
          //marginRight: 20,
          marginTop: 20,
          //marginBottom: 20,
          alignSelf: "center",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: "100%",
    height: 150,
    //marginTop: 20,
  },
  viewContainer: {
    marginRight: 40,
    marginLeft: 40,
  },
  textRegister: {
    marginTop: 15,
    marginLeft: 10,
    marginRight: 10,
  },
  btnRegister: {
    color: "#93bf22",
    fontWeight: "bold",
  },
  divider: {
    backgroundColor: "#00a680",
    marginHorizontal: 40,
    marginTop: 20,
  },
});
