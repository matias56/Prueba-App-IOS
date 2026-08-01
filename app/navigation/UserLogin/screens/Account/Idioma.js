import React, { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  DeviceEventEmitter,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import lang from "../../../../utils/language";
import { Icon, Avatar, Image, Input, Divider } from "react-native-elements";
import Toast from "react-native-root-toast";
import initialState from "../../../../utils/user";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import Loading from "../../../../components/Loading";

export default function Idioma() {
  const toastRef = useRef();
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginText, setloginText] = useState("es");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getValueEmail("email");
    getValuePassword("password");
  }, []);

  useEffect(() => {
    if (email || password) {
      getValueLang("language");
    }
  }, [password]);

  useEffect(() => {
    DeviceEventEmitter.addListener("cleanEmailPassword", (event) => {
      setEmail(event.clean);
      setPassword(event.clean);
    });
  }, []);

  async function save(key, value) {
    await SecureStore.setItemAsync(key, value);
  }

  async function getValueEmail(key) {
    let result = await SecureStore.getItemAsync(key);
    if (result) {
      setEmail(result);
      //console.log(result);
    } else {
      setEmail("");
    }
  }

  async function getValuePassword(key) {
    let result = await SecureStore.getItemAsync(key);
    if (result) {
      setPassword(result);
      //console.log(result);
    } else {
      setPassword("");
      setLoading(false);
    }
  }

  async function getValueLang(key) {
    let result = await SecureStore.getItemAsync(key);
    if (result === "pt-br") {
      lang.idioma = "pt-br";
      DeviceEventEmitter.emit("idioma", {
        idioma: "pt-br",
      });
      email === "" && password === ""
        ? initialState.userID === "invitado"
          ? navigation.navigate("inicio")
          : navigation.navigate("login")
        : onSubmit();
      //console.log(result);
    } else if (result === "es") {
      lang.idioma = "es";
      DeviceEventEmitter.emit("idioma", {
        idioma: "es",
      });
      email === "" && password === ""
        ? initialState.userID === "invitado"
          ? navigation.navigate("inicio")
          : navigation.navigate("login")
        : onSubmit();
    } else {
      console.log("no hay idioma");
      setLoading(false);
    }
  }

  const onSubmit = () => {
    if (!(email === "") && !(password === "")) {
      console.log(email);
      console.log(password);

      axios
        .get(
          `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/login-app.php?email=${email}&password=${password}`
        )
        .then(function (response) {
          // handle success
          console.log(JSON.stringify(response.data[0]));
          if (response.data[0].validation === "ok") {
            initialState.isAuthorized = true;
            initialState.userID = response.data[0].user;
            initialState.lastname = response.data[0].apellidos;
            initialState.username = response.data[0].nombre;
            initialState.empresa = response.data[0].empresa;
            initialState.userImage = response.data[0].foto;
            initialState.cargo = response.data[0].cargo;
            initialState.actividad = response.data[0].actividad;

            response.data[0].misintereses === null
              ? (initialState.misIntereses = [])
              : (initialState.misIntereses =
                  response.data[0].misintereses.split(","));

            initialState.especies = response.data[0].Especies.split(",");
            initialState.detallesEspecies =
              response.data[0].Detallesotros.split(",");
            initialState.favoritosCanales = response.data[0].favoritos_canales;
            initialState.favoritosPodcast = response.data[0].favoritos_podcast;
            initialState.idioma = response.data[0].idioma;
            initialState.country = response.data[0].id_pais;
            initialState.movil = response.data[0].movil;

            if (response.data[0].like_podcast === null) {
              // establece un array vació si no hay canales favoritos
              initialState.likes = [];
            } else {
              initialState.likes = response.data[0].like_podcast;
            }

            if (initialState.especies === null) {
              // establece un array vació si no hay canales favoritos
              initialState.especies = [];
            } else if (!initialState.especies) {
              initialState.especies = [];
            }

            if (initialState.detallesEspecies === null) {
              // establece un array vació si no hay canales favoritos
              initialState.detallesEspecies = [];
            } else if (!initialState.detallesEspecies) {
              initialState.detallesEspecies = [];
            }

            if (initialState.misIntereses === null) {
              // establece un array vació si no hay canales favoritos
              initialState.misIntereses = [];
            } else if (!initialState.misIntereses) {
              initialState.misIntereses = [];
            }

            if (initialState.favoritosCanales === null) {
              // establece un array vació si no hay canales favoritos
              initialState.favoritosCanales = [];
            } else if (!initialState.favoritosCanales) {
              initialState.favoritosCanales = [];
            }

            if (initialState.favoritosPodcast === null) {
              // establece un array vació si no hay podcast favoritos
              initialState.favoritosPodcast = [];
            } else if (!initialState.favoritosPodcast) {
              initialState.favoritosPodcast = [];
            }

            DeviceEventEmitter.emit("library", {
              favoritosPodcast: initialState.favoritosPodcast,
            });

            console.log(initialState);

            setLoading(false);

            if (initialState.misIntereses.length < 5) {
              navigation.navigate("select-intereses");
            } else {
              navigation.navigate("inicio");
            }
          } else if (
            response.data[0].validation ===
            "No hemos encontrado ningún usuario con este email, por favor cree una cuenta."
          ) {
            Toast.show(
              language === "es"
                ? "No hemos encontrado ningún usuario con este email, por favor cree una cuenta"
                : "Não encontramos nenhum usuário com este e-mail, crie uma conta",
              {
                position: Toast.positions.CENTER,
              }
            );
          } else {
            console.log(JSON.stringify(response.data[0]));
            Toast.show(
              language === "es"
                ? "Revise su email y contraseña"
                : "Verifique seu e-mail e senha",
              {
                position: Toast.positions.CENTER,
              }
            );
          }
        })

        .then(function () {});
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <Text
        style={{
          fontSize: 18,
          alignSelf: "center",
          margin: 20,
          fontWeight: "bold",
        }}
      >
        Please select your language
      </Text>
      <Avatar
        size="large"
        source={require("../../../../../assets/img/flag-brazil.png")}
        rounded
        onPress={() => {
          save("language", "pt-br");
          lang.idioma = "pt-br";
          DeviceEventEmitter.emit("idioma", {
            idioma: "pt-br",
          });
          email === "" && password === ""
            ? initialState.userID === "invitado"
              ? navigation.navigate("inicio")
              : navigation.navigate("login")
            : onSubmit();
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
        source={require("../../../../../assets/img/flag-spain.png")}
        rounded
        onPress={() => {
          save("language", "es");
          lang.idioma = "es";
          DeviceEventEmitter.emit("idioma", {
            idioma: "es",
          });
          email === "" && password === ""
            ? initialState.userID === "invitado"
              ? navigation.navigate("inicio")
              : navigation.navigate("login")
            : onSubmit();
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
        source={require("../../../../../assets/img/flag-uk.png")}
        rounded
        onPress={() => {
          Toast.show("Esta opción no está disponible aún", {
            position: Toast.positions.CENTER,
          });
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

      <Loading isVisible={loading} />
    </View>
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
    marginHorizontal: 40,
    marginTop: 20,
  },
});
