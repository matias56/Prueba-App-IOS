import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  Image,
  DeviceEventEmitter,
} from "react-native";
import { Button } from "react-native-elements";
import { SvgCssUri } from "react-native-svg";
import lang from "../../utils/language";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

export default function UserGuest() {
  const navigation = useNavigation();
  const [language, setLanguage] = useState(lang.idioma);

  useFocusEffect(
    useCallback(() => {
      setLanguage(lang.idioma);
    }, [lang])
  );

  return (
    <ScrollView
      centerContent={true}
      contentContainerStyle={{
        marginTop: 30,
      }}
      style={styles.viewBody}
    >
      <SvgCssUri
        style={{ width: 150, height: 75, alignSelf: "center", marginTop: 20 }}
        uri="https://socialagri.com/agriFM/wp-content/themes/agriFM/mobile/img/logo-aginewsfm4.svg"
      />
      <Image
        source={require("../../../assets/img/user-guest.jpg")}
        resizeMode="contain"
        style={styles.image}
      />
      <Text style={styles.title}>
        {language === "es"
          ? "Consulta tu perfil de agriFM"
          : "Consulte o seu perfil agriFM"}
      </Text>
      <Text style={styles.description}>
        {language === "es"
          ? `Para ir a su perfil, debe registrarse. ${"\n"}¡Solo es un minuto y gratuito!`
          : `Para ir ao seu perfil, você deve se registrar. ${"\n"}É apenas um minuto e grátis!`}
      </Text>
      <Text style={styles.description}></Text>
      <View style={styles.viewBtn}>
        <Button
          title={language === "es" ? "Ir al login" : "Ir ao login"}
          buttonStyle={styles.btnStyle}
          containerStyle={styles.btnContainer}
          onPress={() => {
            DeviceEventEmitter.emit("userInvitado", {
              cancion: null,
            });
            navigation.navigate("log", { screen: "login" });
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    backgroundColor: "#422c5e",
  },
  image: {
    height: 150,
    width: "100%",
    marginBottom: 40,
    marginTop: 40,
  },
  title: {
    fontWeight: "bold",
    fontSize: 19,
    marginBottom: 10,
    textAlign: "center",
    color: "#ffffff",
  },
  description: {
    textAlign: "center",
    color: "#ffffff",
  },
  viewBtn: {
    flex: 1,
    alignItems: "center",
  },
  btnStyle: {
    backgroundColor: "#93bf22",
  },
  btnContainer: {
    width: 200,
  },
});
