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

export default function SelectorDetallesEspecies() {
  const toastRef = useRef();
  const navigation = useNavigation();
  const [language, setLanguage] = useState(lang.idioma);
  const [listDetallesEspecies, setlistDetallesEspecies] = useState(
    initialState.detallesEspecies
  );
  const [update, setUpdate] = useState(false);

  navigation.setOptions({
    title:
      language == "es"
        ? "Selección detalles especies"
        : "Seleção de detalhes da espécie",
  });

  const onSubmit = () => {
    axios
      .get(
        `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/updatedetallesespecies-app.php?id_user=${initialState.userID}&despecies=${initialState.detallesEspecies}`
      )
      .then(function (response) {
        if (response.data[0].validation === "ok") {
          console.log(initialState);
          navigation.navigate("account");
          initialState.misIntereses = [];
          Toast.show(
            language === "es"
              ? "Se han cambiado los detalles de especies"
              : "Os detalhes das espécies foram alterados",
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
      setlistDetallesEspecies(initialState.detallesEspecies);
      setUpdate(false);
    }, [initialState, update])
  );

  useEffect(() => {
    listaDetallesEspecies();
  }, [listDetallesEspecies]);

  const sendDetallesEspecies = (value) => {
    if (
      initialState.detallesEspecies.find((element) => element === `${value}`)
    ) {
      for (var i = 0; i < initialState.detallesEspecies.length; i++) {
        if (initialState.detallesEspecies[i] === `${value}`) {
          initialState.detallesEspecies.splice(i, 1);
        }
      }
      console.log(initialState.detallesEspecies);
      setUpdate(true);
    } else if (value) {
      initialState.detallesEspecies.push(`${value}`);
      console.log(initialState.detallesEspecies);
      setUpdate(true);
    }
  };

  const [detallesEspecies, setDetallesEspecies] = useState([]);
  //URL: la URL de tu endpoint API
  function listaDetallesEspecies() {
    const response = fetch(
      `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/animals-app.php`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
        setDetallesEspecies(response);
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
          ? "Seleccione detalles de especies"
          : "Selecionar detalhes da espécie"}
      </Text>
      {detallesEspecies.map((l, i) => (
        <View style={{ flexDirection: "row" }}>
          {l.id == initialState.detallesEspecies[0] ||
          l.id == initialState.detallesEspecies[1] ||
          l.id == initialState.detallesEspecies[2] ||
          l.id == initialState.detallesEspecies[3] ||
          l.id == initialState.detallesEspecies[4] ||
          l.id == initialState.detallesEspecies[5] ||
          l.id == initialState.detallesEspecies[6] ||
          l.id == initialState.detallesEspecies[7] ||
          l.id == initialState.detallesEspecies[8] ||
          l.id == initialState.detallesEspecies[9] ||
          l.id == initialState.detallesEspecies[10] ||
          l.id == initialState.detallesEspecies[11] ||
          l.id == initialState.detallesEspecies[12] ||
          l.id == initialState.detallesEspecies[13] ||
          l.id == initialState.detallesEspecies[14] ||
          l.id == initialState.detallesEspecies[15] ||
          l.id == initialState.detallesEspecies[16] ||
          l.id == initialState.detallesEspecies[17] ||
          l.id == initialState.detallesEspecies[18] ||
          l.id == initialState.detallesEspecies[19] ||
          l.id == initialState.detallesEspecies[20] ||
          l.id == initialState.detallesEspecies[21] ||
          l.id == initialState.detallesEspecies[22] ? (
            <Icon
              name="checkbox-marked"
              type="material-community"
              color="#fff"
              size={30}
              onPress={() => {
                sendDetallesEspecies(l.id);
              }}
            />
          ) : (
            <Icon
              name="checkbox-blank"
              type="material-community"
              color="#fff"
              size={30}
              onPress={() => {
                sendDetallesEspecies(l.id);
              }}
            />
          )}

          <Text
            onPress={() => {
              sendDetallesEspecies(l.id);
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
