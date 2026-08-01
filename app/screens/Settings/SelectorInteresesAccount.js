import React, { useRef, useState, useEffect, useCallback } from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import lang from "../../utils/language";
import {
  Icon,
  Avatar,
  Image,
  Input,
  Divider,
  Button,
  CheckBox,
} from "react-native-elements";
import Toast from "react-native-root-toast";
import initialState from "../../utils/user";
import axios from "axios";

export default function SelectorInteresesAccount() {
  const toastRef = useRef();
  const navigation = useNavigation();
  const [language, setLanguage] = useState(lang.idioma);
  const [check, setCheck] = useState(false);
  const [listInterest, setlistInterest] = useState(initialState.misIntereses);
  const [update, setUpdate] = useState(false);

  navigation.setOptions({
    title: language == "es" ? "Cambiar intereses" : "Alterar interesses",
  });

  const onSubmit = () => {
    if (initialState.misIntereses.length < 5) {
      Toast.show(
        language === "es"
          ? "Seleccione un mínimo de 5 intereses"
          : "Selecione um mínimo de 5 interesses",
        {
          position: Toast.positions.CENTER,
        }
      );
    } else {
      axios
        .get(
          `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/intereses-app.php?id_user=${initialState.userID}&intereses=${initialState.misIntereses}`
        )
        .then(function (response) {
          if (response.data === "ok") {
            console.log(initialState);
            navigation.navigate("account");
            initialState.misIntereses = [];
          } else {
            Toast.show(
              language === "es"
                ? "Ha habido un problema de intentelo de nuevo"
                : "Houve um problema, tente novamente",
              {
                position: Toast.positions.CENTER,
              }
            );
          }
        })

        .then(function () {});
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLanguage(lang.idioma);
      setlistInterest(initialState.misIntereses);
      setUpdate(false);
    }, [initialState, update])
  );

  useEffect(() => {
    listaIntereses();
  }, [listInterest]);

  const sendIntereses = (value) => {
    if (initialState.misIntereses.find((element) => element === `${value}`)) {
      for (var i = 0; i < initialState.misIntereses.length; i++) {
        if (initialState.misIntereses[i] === `${value}`) {
          initialState.misIntereses.splice(i, 1);
        }
      }
      console.log(initialState.misIntereses);
      setUpdate(true);
    } else if (value) {
      initialState.misIntereses.push(`${value}`);
      console.log(initialState.misIntereses);
      setUpdate(true);
    }
  };

  const [intereses, setIntereses] = useState([]);
  //URL: la URL de tu endpoint API
  function listaIntereses() {
    const response = fetch(
      `https://socialagri.com/agriFM/wp-json/wp/v2/intereses/?lang=es&per_page=100`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((response) => response.json())
      .then((responseJson) => {
        //alert(JSON.stringify(responseJson));
        //console.log(typeof responseJson);
        setIntereses(responseJson); //sale undefined quitar .results

        //acf.link_podcast1
        //acf.imagen_podcast1
        //title.rendered Titulo del podcast
        //yoast_head_json.og_description Descripcion del podcast
      })
      .catch((error) => {
        //Error
        console.error(error);
      });
  }

  return (
    <ScrollView
      contentContainerStyle={{
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#9a4dff",
      }}
    >
      <Text
        style={{
          fontSize: 22,
          alignSelf: "center",
          margin: 20,
          marginTop: 50,
          fontWeight: "bold",
          color: "#fff",
        }}
      >
        {language === "es"
          ? "Seleccione 5 intereses"
          : "Selecione 5 interesses"}
      </Text>
      {intereses.map((l, i) => (
        <View style={{ flexDirection: "row" }}>
          {l.id == initialState.misIntereses[0] ||
          l.id == initialState.misIntereses[1] ||
          l.id == initialState.misIntereses[2] ||
          l.id == initialState.misIntereses[3] ||
          l.id == initialState.misIntereses[4] ||
          l.id == initialState.misIntereses[5] ||
          l.id == initialState.misIntereses[6] ||
          l.id == initialState.misIntereses[7] ||
          l.id == initialState.misIntereses[8] ||
          l.id == initialState.misIntereses[9] ||
          l.id == initialState.misIntereses[10] ||
          l.id == initialState.misIntereses[11] ||
          l.id == initialState.misIntereses[12] ||
          l.id == initialState.misIntereses[13] ||
          l.id == initialState.misIntereses[14] ? (
            <Icon
              name="checkbox-marked"
              type="material-community"
              color="#fff"
              size={30}
              onPress={() => {
                sendIntereses(l.id);
              }}
            />
          ) : (
            <Icon
              name="checkbox-blank"
              type="material-community"
              color="#fff"
              size={30}
              onPress={() => {
                sendIntereses(l.id);
              }}
            />
          )}

          <Text
            onPress={() => {
              sendIntereses(l.id);
            }}
            style={{ width: 250, fontSize: 18, marginLeft: 15, color: "#fff" }}
          >
            {language === "es" ? l.name : l.acf.name_pt}
          </Text>
          <Divider style={styles.divider} />
        </View>
      ))}

      <Button
        title={language === "es" ? "Guardar intereses" : "Salvar o interesse"}
        containerStyle={styles.btnContainerLogin}
        buttonStyle={styles.btnLogin}
        onPress={onSubmit}
      />
      <View style={{ marginBottom: 100 }}></View>
    </ScrollView>
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
    backgroundColor: "#fff",
    marginTop: 20,
    marginBottom: 30,
    height: 4,
  },
  btnContainerLogin: {
    marginTop: 20,
    width: "90%",
  },
  btnLogin: {
    backgroundColor: "#93bf22",
    paddingTop: 20,
    paddingBottom: 20,
  },
});
