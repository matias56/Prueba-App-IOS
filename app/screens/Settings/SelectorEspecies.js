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

export default function SelectorEspecies() {
  const toastRef = useRef();
  const navigation = useNavigation();
  const [language, setLanguage] = useState(lang.idioma);
  const [listEspecies, setlistEspecies] = useState(initialState.especies);
  const [update, setUpdate] = useState(false);

  navigation.setOptions({
    title: language == "es" ? "Selección de especies" : "Seleção de espécies",
  });

  const onSubmit = () => {
    axios
      .get(
        `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/updateespecies-app.php?id_user=${initialState.userID}&especies=${initialState.especies}`
      )
      .then(function (response) {
        if (response.data[0].validation === "ok") {
          console.log(initialState);
          navigation.navigate("account");
          initialState.misIntereses = [];
          Toast.show(
            language === "es"
              ? "Se han cambiado las especies"
              : "As espécies foram alteradas",
            {
              position: Toast.positions.CENTER,
            }
          );
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
  };

  useFocusEffect(
    useCallback(() => {
      setLanguage(lang.idioma);
      setlistEspecies(initialState.especies);
      setUpdate(false);
    }, [initialState, update])
  );

  useEffect(() => {
    listaEspecies();
  }, [listEspecies]);

  const sendEspecies = (value) => {
    if (initialState.especies.find((element) => element === `${value}`)) {
      for (var i = 0; i < initialState.especies.length; i++) {
        if (initialState.especies[i] === `${value}`) {
          initialState.especies.splice(i, 1);
        }
      }
      console.log(initialState.especies);
      setUpdate(true);
    } else if (value) {
      initialState.especies.push(`${value}`);
      console.log(initialState.especies);
      setUpdate(true);
    }
  };

  const [especies, setEspecies] = useState([]);
  //URL: la URL de tu endpoint API
  function listaEspecies() {
    const response = fetch(
      `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/especies-app.php`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
        setEspecies(response);
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
        {language === "es" ? "Seleccione las especies" : "Selecionar espécies"}
      </Text>
      {especies.map((l, i) => (
        <View style={{ flexDirection: "row" }}>
          {l.id == initialState.especies[0] ||
          l.id == initialState.especies[1] ||
          l.id == initialState.especies[2] ||
          l.id == initialState.especies[3] ||
          l.id == initialState.especies[4] ||
          l.id == initialState.especies[5] ||
          l.id == initialState.especies[6] ? (
            <Icon
              name="checkbox-marked"
              type="material-community"
              color="#fff"
              size={30}
              onPress={() => {
                sendEspecies(l.id);
              }}
            />
          ) : (
            <Icon
              name="checkbox-blank"
              type="material-community"
              color="#fff"
              size={30}
              onPress={() => {
                sendEspecies(l.id);
              }}
            />
          )}

          <Text
            onPress={() => {
              sendEspecies(l.id);
            }}
            style={{ width: 250, fontSize: 18, marginLeft: 15, color: "#fff" }}
          >
            {language === "es" ? l.nombrees : l.nombrept}
          </Text>
          <Divider style={styles.divider} />
        </View>
      ))}

      <Button
        title={language === "es" ? "Guardar especies" : "Salvar espécies"}
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
