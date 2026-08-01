import React, { useEffect, useRef, useState } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  FlatList,
  Picker,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Icon, Avatar, Image, Input, Button } from "react-native-elements";
import initialState from "../../utils/user";
import axios from "axios";
import lang from "../../utils/language";
import Toast from "react-native-root-toast";

export default function editProfile(props) {
  // validaciones al actualizar un usuario
  const { toastRef, setIsLoading, navigation } = props;
  const [name, setName] = useState(initialState.username);
  const [lastName, setLastName] = useState(initialState.lastname);
  const [empresa, setEmpresa] = useState(initialState.empresa);
  const [cargo, setCargo] = useState(initialState.cargo);
  const [actividad, setActividad] = useState(initialState.actividad);
  const [language, setlanguage] = useState(lang.idioma);
  const [idiomaUser, setIdiomaUser] = useState(initialState.idioma);
  const [country, setCountry] = useState(initialState.country);

  const [movil, setMovil] = useState(initialState.movil);

  useEffect(() => {
    ListCargos();
    ListActividades();
    ListIdiomas();
    ListPaises();
  }, []);

  navigation.setOptions({
    title:
      language == "es"
        ? "Editar tu perfil de usuario"
        : "Edite seu perfil de usuário",
  });

  const [cargos, setCargos] = useState([]);

  function ListCargos() {
    const response = fetch(
      `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/cargo-app.php`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((response) => response.json())
      .then((response) => {
        //console.log(response);
        setCargos(response);
      });
  }

  const [actividades, setActividades] = useState([]);

  function ListActividades() {
    const response = fetch(
      `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/actividad-app.php`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((response) => response.json())
      .then((response) => {
        //console.log(response);
        setActividades(response);
      });
  }

  const [idiomas, setIdiomas] = useState([]);

  function ListIdiomas() {
    const response = fetch(
      `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/idioma-app.php`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((response) => response.json())
      .then((response) => {
        //console.log(response);
        setIdiomas(response);
      });
  }

  const [paises, setPaises] = useState([]);

  function ListPaises() {
    if (language === "es") {
      const response = fetch(
        `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/country-app-es.php`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      )
        .then((response) => response.json())
        .then((response) => {
          //console.log(response);
          setPaises(response);
        });
    } else {
      const response = fetch(
        `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/country-app-pt.php`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      )
        .then((response) => response.json())
        .then((response) => {
          //console.log(response);
          setPaises(response);
        });
    }
  }

  const UpdateUser = () => {
    axios
      .get(
        `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/editprofile-app.php?id_user=${initialState.userID}&name_user=${name}&lastname_user=${lastName}&empresa=${empresa}&cargo=${cargo}&actividad=${actividad}&idioma=${idiomaUser}&country=${country}&phone=${movil}`
      )
      .then(function (response) {
        console.log(response);
        console.log(response.data[0].validation);
        if (response.data[0].validation === "ok") {
          initialState.username = name;
          initialState.lastname = lastName;
          initialState.empresa = empresa;
          initialState.cargo = cargo;
          initialState.actividad = actividad;
          initialState.idioma = idiomaUser;
          initialState.country = country;
          initialState.movil = movil;
          navigation.navigate("account");
          initialState.misIntereses = [];

          Toast.show("Perfil de usuarió actualizado", {
            position: Toast.positions.CENTER,
          });
        }
      })

      .then(function () {});
  };

  const PickerCargos = () => {};

  return (
    <ScrollView style={{ backgroundColor: "#422c5e" }}>
      <FormAdd
        setName={setName}
        setLastName={setLastName}
        setEmpresa={setEmpresa}
        setMovil={setMovil}
        language={language}
      />
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View style={{ width: "95%", marginBottom: 5 }}>
          <Text style={styles.labelTitle}>
            {language === "es" ? "Cargo" : "Posição"}
          </Text>
        </View>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={cargo}
            style={{
              width: Platform.OS === "android" ? "95%" : "60%",
              color: Platform.OS === "android" ? "#fff" : "#444444",
            }}
            onValueChange={(itemValue) => setCargo(itemValue)}
          >
            {cargos.map((l, i) => (
              <Picker.Item
                color="#422c5e"
                label={language === "es" ? l.nombrees : l.nombrept}
                value={l.id}
              />
            ))}
          </Picker>
        </View>
        <View style={{ width: "95%", marginBottom: 5 }}>
          <Text style={styles.labelTitle}>
            {language === "es" ? "Actividad" : "Actividade"}
          </Text>
        </View>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={actividad}
            style={{
              width: Platform.OS === "android" ? "95%" : "60%",
              color: Platform.OS === "android" ? "#fff" : "#444444",
            }}
            onValueChange={(itemValue) => setActividad(itemValue)}
          >
            {actividades.map((l, i) => (
              <Picker.Item
                color="#422c5e"
                label={language === "es" ? l.nombrees : l.nombrept}
                value={l.id}
              />
            ))}
          </Picker>
        </View>
        <View style={{ width: "95%", marginBottom: 5 }}>
          <Text style={styles.labelTitle}>Idioma</Text>
        </View>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={idiomaUser}
            style={{
              width: Platform.OS === "android" ? "95%" : "60%",
              color: Platform.OS === "android" ? "#fff" : "#444444",
            }}
            onValueChange={(itemValue) => setIdiomaUser(itemValue)}
          >
            {idiomas.map((l, i) => (
              <Picker.Item
                color="#422c5e"
                label={language === "es" ? l.nombrees : l.nombrept}
                value={l.id}
              />
            ))}
          </Picker>
        </View>
        <View style={{ width: "95%", marginBottom: 5 }}>
          <Text style={styles.labelTitle}>País</Text>
        </View>
        <View style={styles.lastPickerContainer}>
          <Picker
            selectedValue={country}
            style={{
              width: Platform.OS === "android" ? "95%" : "60%",
              color: Platform.OS === "android" ? "#fff" : "#444444",
            }}
            onValueChange={(itemValue) => setCountry(itemValue)}
          >
            {paises.map((l, i) => (
              <Picker.Item
                color="#422c5e"
                label={language === "es" ? l.nombrees : l.nombrept}
                value={l.id}
              />
            ))}
          </Picker>
        </View>
        <Text style={styles.emailMSG}>
          {language === "es"
            ? "* Para cambiar el email deberá contactar con info@agrinews.es"
            : "* Para alterar o email deve contactar info@agrinews.es"}
        </Text>
      </View>
      <Button
        title={language === "es" ? "Actualizar Perfil" : "Atualizar perfil"}
        buttonStyle={styles.btnStyle}
        onPress={UpdateUser}
      />
      <View style={{ height: 100 }}></View>
    </ScrollView>
  );
}

function FormAdd(props) {
  const { setName, setLastName, setEmpresa, setMovil, language } = props;

  return (
    <View style={styles.viewForm}>
      <Text style={styles.labelTitle}>
        {language === "es" ? "Nombre" : "Nome"}
      </Text>
      <Input
        placeholder={language === "es" ? "Nombre" : "Nome"}
        containerStyle={styles.input}
        style={styles.placeholder}
        onChange={(e) => setName(e.nativeEvent.text)}
        defaultValue={initialState.username}
      />
      <Text style={styles.labelTitle}>
        {language === "es" ? "Apellidos" : "Sobrenomes"}
      </Text>
      <Input
        placeholder={language === "es" ? "Apellidos" : "Sobrenomes"}
        containerStyle={styles.input}
        style={styles.placeholder}
        onChange={(e) => setLastName(e.nativeEvent.text)}
        defaultValue={initialState.lastname}
      />
      <Text style={styles.labelTitle}>
        {language === "es" ? "Empresa" : "Companhia"}
      </Text>
      <Input
        placeholder={language === "es" ? "Empresa" : "Companhia"}
        containerStyle={styles.input}
        style={styles.placeholder}
        onChange={(e) => setEmpresa(e.nativeEvent.text)}
        defaultValue={initialState.empresa}
      />
      <Text style={styles.labelTitle}>
        {language === "es" ? "Movil" : "Móvel"}
      </Text>
      <Input
        placeholder={language === "es" ? "Movil" : "Móvel"}
        containerStyle={styles.input}
        style={styles.placeholder}
        onChange={(e) => setMovil(e.nativeEvent.text)}
        defaultValue={initialState.movil}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  emailMSG: {
    color: "#ffffff",
    paddingBottom: 30,
    marginRight: 10,
    marginLeft: 10,
    fontSize: 12,
    marginTop: -10,
  },
  logo: {
    width: "100%",
    height: 150,
    marginTop: 20,
  },
  placeholder: {
    fontWeight: "bold",
    color: "#fff",
  },
  labelTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
  },
  pickerContainer: {
    width: "90%",
    alignItems: "center",
    backgroundColor: Platform.OS === "android" ? "#9a4dff" : "#ffffff",
    marginBottom: 20,
    borderBottomColor: "#fff",
    borderBottomWidth: 2,
  },
  lastPickerContainer: {
    width: "90%",
    alignItems: "center",
    backgroundColor: Platform.OS === "android" ? "#9a4dff" : "#ffffff",
    marginBottom: 30,
    borderBottomColor: "#fff",
    borderBottomWidth: 2,
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
  btnStyle: {
    backgroundColor: "#93bf22",
    height: 50,
    marginLeft: 20,
    marginRight: 20,
  },
  divider: {
    backgroundColor: "#00a680",
    margin: 40,
  },
  viewForm: {
    marginLeft: 10,
    marginRight: 10,
    marginTop: 30,
  },
  input: {
    marginBottom: 10,
  },
});
