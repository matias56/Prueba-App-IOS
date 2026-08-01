import React, { useRef, useState } from "react";
import { StyleSheet, View, ScrollView, Text, Image } from "react-native";
import { Divider } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-easy-toast";
import LoginForm from "../../../../components/Account/LoginForm";
import lang from "../../../../utils/language";

export default function Login() {
  const toastRef = useRef();

  return (
    <ScrollView>
      <View style={styles.viewContainer}>
        <LoginForm toastRef={toastRef} />
        {/*<CreateAccount />*/}
      </View>
      <Divider style={styles.divider} />
      <View style={styles.viewContainer}></View>
      <Toast ref={toastRef} position="center" opacity={0.9} />
    </ScrollView>
  );
}

function CreateAccount() {
  const navigation = useNavigation();
  const [language, setLanguage] = useState(lang.idioma);

  return (
    <Text style={styles.textRegister}>
      {language === "es"
        ? "¿Aún no tienes una cuenta?"
        : "Não tens uma conta ainda?"}{" "}
      <Text
        style={styles.btnRegister}
        onPress={() => navigation.navigate("register")}
      >
        {language === "es" ? "Regístrate" : "Cadastre-se"}
      </Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: "100%",
    height: 150,
    marginTop: 20,
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
    margin: 40,
  },
});
