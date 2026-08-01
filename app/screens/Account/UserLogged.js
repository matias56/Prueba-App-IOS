import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  DeviceEventEmitter,
  Platform,
  Linking,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import initialState from "../../utils/user";
import lang from "../../utils/language";
import Loading from "../../components/Loading";
import { Button, Avatar, ListItem } from "react-native-elements";
import axios from "axios";
import Toast from "react-native-root-toast";
import ImageUser from "../../components/Account/ImageUser";
import * as SecureStore from "expo-secure-store";
import { decode, encode } from "base-64";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default function UserLogged() {
  const navigation = useNavigation();
  const toastRef = useRef();
  const [language, setLanguage] = useState(lang.idioma);
  const [userInfo, setUserInfo] = useState(initialState); //esta vacio para que no se muetre el valor a no ser que tenga uno en User Info
  const [interesesUser, setInteresesUser] = useState(initialState.misIntereses);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [cargo, setCargo] = useState(initialState.cargo);
  const [actividad, setActividad] = useState(initialState.actividad);
  const [especie, setEspecie] = useState(initialState.especies);
  const [detalleEspecie, setDetalleEspecie] = useState(
    initialState.detallesEspecies
  );
  const [imageUser, setImageUser] = useState(initialState.userImage);

  //const [update, setUpdate] = useState(false);

  //const listaIntereses = () => {
  //  for (let i = 0; i < initialState.misIntereses.length; i++) {
  //    const element = initialState.misIntereses[i];
  //  }
  //};

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
        console.log(response);
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

  useEffect(() => {
    setLoading(true);
    postIntereses();
    actualizaPerfil();
    ListCargos();
    ListActividades();
    listaEspecies();
    listaDetallesEspecies();
    setEspecie(initialState.especies);
    setCargo(initialState.cargo);
    setActividad(initialState.actividad);
    setDetalleEspecie(initialState.detallesEspecies);
  }, [language, interesesUser]);

  useFocusEffect(
    useCallback(() => {
      setLanguage(lang.idioma);
      setInteresesUser(initialState.misIntereses);
      //console.log(interesesUser);
    }, [lang, initialState])
  );

  const sendIntereses = (value) => {
    if (initialState.misIntereses.length > 5) {
      if (initialState.misIntereses.find((element) => element === `${value}`)) {
        for (var i = 0; i < initialState.misIntereses.length; i++) {
          if (initialState.misIntereses[i] === `${value}`) {
            initialState.misIntereses.splice(i, 1);
            axios
              .get(
                `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/intereses-app.php?id_user=${initialState.userID}&intereses=${initialState.misIntereses}`
              )
              .then(() => {
                setInteresesUser(initialState.misIntereses);
                console.log(interesesUser);
              })

              .then(function () {});
          }
        }
      }
    } else {
      Toast.show(
        language === "es"
          ? "No puedes tener menos de cinco intereses"
          : "Você não pode ter menos de cinco interesses",
        {
          position: Toast.positions.CENTER,
        }
      );
      console.log("menos de 5");
    }
  };

  function alertBorrarInteres(value, id) {
    return Alert.alert(
      language === "es"
        ? `¿Quiere eliminar el siguiente interés de su perfil? `
        : `Quer remover o seguinte interesse do seu perfil? `,
      `${value}`,
      //`${id}`,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: () => sendIntereses(id) },
      ]
    );
  }

  function actualizaPerfil() {
    axios
      .get(
        `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/misintereses-app.php?id_user=${initialState.userID}}`
      )
      .then(function (response) {
        initialState.misIntereses = response.data[0].misintereses.split(",");
        initialState.cargo = response.data[0].cargo;
        initialState.actividad = response.data[0].actividad;
        initialState.especies = response.data[0].Especies.split(",");
        initialState.detallesEspecies =
          response.data[0].Detallesotros.split(",");
      })

      .then(function () {});
  }

  const [intereses, setIntereses] = useState();
  //URL: la URL de tu endpoint API
  function postIntereses() {
    const response = fetch(
      `https://socialagri.com/agriFM/wp-json/wp/v2/intereses/?per_page=100`,
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
        setLoading(false);

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

  var base64 = require("base-64");

  //console.log(base64.encode(initialState.userID));

  return (
    <ScrollView style={styles.container}>
      <Avatar
        size="small"
        source={
          language === "es"
            ? require("../../../assets/img/flag-spain.png")
            : require("../../../assets/img/flag-brazil.png")
        }
        rounded
        onPress={() => {
          navigation.push("select-language");
        }}
        activeOpacity={0.7}
        containerStyle={{
          alignSelf: "flex-end",
          marginTop: Platform.OS === "android" ? 55 : 75,
        }}
      />
      <Loading
        isVisible={loading}
        text={
          language === "es" ? "Cargando Podcast..." : "Carregando Podcast..."
        }
      />
      {userInfo && (
        <ImageUser
          userInfo={userInfo}
          toastRef={toastRef}
          setLoading={setLoading}
          setLoadingText={setLoadingText}
          imageUser={imageUser}
          setImageUser={setImageUser}
        />
      )}

      <Text style={styles.title}>
        {language === "es" ? "Bienvenido" : "Bem vindo"} {initialState.username}{" "}
        {initialState.lastname}
      </Text>
      {cargos.length !== 0 &&
      actividades.length !== 0 &&
      especies.length !== 0 &&
      detallesEspecies.length !== 0 ? (
        <View
          style={{
            backgroundColor: "#594079",
            borderRadius: 10,
            paddingLeft: 15,
            paddingTop: 10,
            marginBottom: 30,
            paddingRight: 10,
          }}
        >
          <Text style={styles.titleh3}>
            {language === "es" ? "Móvil:" : "Celular:"} {"+"}
            {initialState.movil}
          </Text>
          <Text style={styles.titleh3}>
            {language === "es" ? "Empresa:" : "Empresa:"} {initialState.empresa}
          </Text>
          <Text style={styles.titleh3}>
            {language === "es" ? "Cargo:" : "Cargo:"}{" "}
            {language === "es"
              ? cargos
                ? cargo == cargos[0].id
                  ? cargos[0].nombrees
                  : cargo == cargos[1].id
                  ? cargos[1].nombrees
                  : cargo == cargos[2].id
                  ? cargos[2].nombrees
                  : cargo == cargos[3].id
                  ? cargos[3].nombrees
                  : cargo == cargos[4].id
                  ? cargos[4].nombrees
                  : cargo == cargos[5].id
                  ? cargos[5].nombrees
                  : cargo == cargos[6].id
                  ? cargos[6].nombrees
                  : cargo == cargos[7].id
                  ? cargos[7].nombrees
                  : cargo == cargos[8].id
                  ? cargos[8].nombrees
                  : cargo == cargos[9].id
                  ? cargos[9].nombrees
                  : cargos[10].nombrees
                : ""
              : cargos
              ? cargo == cargos[0].id
                ? cargos[0].nombrept
                : cargo == cargos[1].id
                ? cargos[1].nombrept
                : cargo == cargos[2].id
                ? cargos[2].nombrept
                : cargo == cargos[3].id
                ? cargos[3].nombrept
                : cargo == cargos[4].id
                ? cargos[4].nombrept
                : cargo == cargos[5].id
                ? cargos[5].nombrept
                : cargo == cargos[6].id
                ? cargos[6].nombrept
                : cargo == cargos[7].id
                ? cargos[7].nombrept
                : cargo == cargos[8].id
                ? cargos[8].nombrept
                : cargo == cargos[9].id
                ? cargos[9].nombrept
                : cargos[10].nombrept
              : ""}
          </Text>
          <Text style={styles.titleh3}>
            {language === "es" ? "Actividad:" : "Atividade da Empresa:"}{" "}
            {language === "es"
              ? actividades
                ? actividad == actividades[0].id
                  ? actividades[0].nombrees
                  : actividad == actividades[1].id
                  ? actividades[1].nombrees
                  : actividad == actividades[2].id
                  ? actividades[2].nombrees
                  : actividad == actividades[3].id
                  ? actividades[3].nombrees
                  : actividad == actividades[4].id
                  ? actividades[4].nombrees
                  : actividad == actividades[5].id
                  ? actividades[5].nombrees
                  : actividad == actividades[6].id
                  ? actividades[6].nombrees
                  : actividad == actividades[7].id
                  ? actividades[7].nombrees
                  : actividad == actividades[8].id
                  ? actividades[8].nombrees
                  : actividad == actividades[9].id
                  ? actividades[9].nombrees
                  : actividad == actividades[10].id
                  ? actividades[10].nombrees
                  : actividad == actividades[11].id
                  ? actividades[11].nombrees
                  : actividad == actividades[12].id
                  ? actividades[12].nombrees
                  : actividad == actividades[13].id
                  ? actividades[13].nombrees
                  : actividad == actividades[14].id
                  ? actividades[14].nombrees
                  : actividad == actividades[15].id
                  ? actividades[15].nombrees
                  : actividad == actividades[16].id
                  ? actividades[16].nombrees
                  : actividad == actividades[17].id
                  ? actividades[17].nombrees
                  : actividad == actividades[18].id
                : actividades[18].nombrees
              : actividades
              ? actividad == actividades[0].id
                ? actividades[0].nombrept
                : actividad == actividades[1].id
                ? actividades[1].nombrept
                : actividad == actividades[2].id
                ? actividades[2].nombrept
                : actividad == actividades[3].id
                ? actividades[3].nombrept
                : actividad == actividades[4].id
                ? actividades[4].nombrept
                : actividad == actividades[5].id
                ? actividades[5].nombrept
                : actividad == actividades[6].id
                ? actividades[6].nombrept
                : actividad == actividades[7].id
                ? actividades[7].nombrept
                : actividad == actividades[8].id
                ? actividades[8].nombrept
                : actividad == actividades[9].id
                ? actividades[9].nombrept
                : actividad == actividades[10].id
                ? actividades[10].nombrept
                : actividad == actividades[11].id
                ? actividades[11].nombrept
                : actividad == actividades[12].id
                ? actividades[12].nombrept
                : actividad == actividades[13].id
                ? actividades[13].nombrept
                : actividad == actividades[14].id
                ? actividades[14].nombrept
                : actividad == actividades[15].id
                ? actividades[15].nombrept
                : actividad == actividades[16].id
                ? actividades[16].nombrept
                : actividad == actividades[17].id
                ? actividades[17].nombrept
                : actividad == actividades[18].id
              : actividades[18].nombrept}
          </Text>
          <Text style={styles.titleh3}>
            {language === "es" ? "Especie:" : "Espécie:"}{" "}
            {language === "es"
              ? especies && especie.length >= 1
                ? especie[0] == especies[0].id
                  ? especies[0].nombrees
                  : especie[0] == especies[1].id
                  ? especies[1].nombrees
                  : especie[0] == especies[2].id
                  ? especies[2].nombrees
                  : especie[0] == especies[3].id
                  ? especies[3].nombrees
                  : especie[0] == especies[4].id
                  ? especies[4].nombrees
                  : especie[0] == especies[5].id
                  ? especies[5].nombrees
                  : ""
                : ""
              : especies && especie.length >= 1
              ? especie[0] == especies[0].id
                ? especies[0].nombrept
                : especie[0] == especies[1].id
                ? especies[1].nombrept
                : especie[0] == especies[2].id
                ? especies[2].nombrept
                : especie[0] == especies[3].id
                ? especies[3].nombrept
                : especie[0] == especies[4].id
                ? especies[4].nombrept
                : especie[0] == especies[5].id
                ? especies[5].nombrept
                : ""
              : ""}
            {especies && especie.length >= 2 ? ", " : ""}
            {language === "es"
              ? especies && especie.length >= 2
                ? especie[1] == especies[0].id
                  ? especies[0].nombrees
                  : especie[1] == especies[1].id
                  ? especies[1].nombrees
                  : especie[1] == especies[2].id
                  ? especies[2].nombrees
                  : especie[1] == especies[3].id
                  ? especies[3].nombrees
                  : especie[1] == especies[4].id
                  ? especies[4].nombrees
                  : especie[0] == especies[5].id
                  ? especies[5].nombrees
                  : ""
                : ""
              : especies && especie.length >= 2
              ? especie[1] == especies[0].id
                ? especies[0].nombrept
                : especie[1] == especies[1].id
                ? especies[1].nombrept
                : especie[1] == especies[2].id
                ? especies[2].nombrept
                : especie[1] == especies[3].id
                ? especies[3].nombrept
                : especie[1] == especies[4].id
                ? especies[4].nombrept
                : especie[0] == especies[5].id
                ? especies[5].nombrept
                : ""
              : ""}
            {especies && especie.length >= 3 ? ", " : ""}
            {language === "es"
              ? especies && especie.length >= 3
                ? especie[2] == especies[0].id
                  ? especies[0].nombrees
                  : especie[2] == especies[1].id
                  ? especies[1].nombrees
                  : especie[2] == especies[2].id
                  ? especies[2].nombrees
                  : especie[2] == especies[3].id
                  ? especies[3].nombrees
                  : especie[2] == especies[4].id
                  ? especies[4].nombrees
                  : especie[2] == especies[5].id
                  ? especies[5].nombrees
                  : ""
                : ""
              : especies && especie.length >= 3
              ? especie[2] == especies[0].id
                ? especies[0].nombrept
                : especie[2] == especies[1].id
                ? especies[1].nombrept
                : especie[2] == especies[2].id
                ? especies[2].nombrept
                : especie[2] == especies[3].id
                ? especies[3].nombrept
                : especie[2] == especies[4].id
                ? especies[4].nombrept
                : especie[2] == especies[5].id
                ? especies[5].nombrept
                : ""
              : ""}
            {especies && especie.length >= 4 ? ", " : ""}
            {language === "es"
              ? especies && especie.length >= 4
                ? especie[3] == especies[0].id
                  ? especies[0].nombrees
                  : especie[3] == especies[1].id
                  ? especies[1].nombrees
                  : especie[3] == especies[2].id
                  ? especies[2].nombrees
                  : especie[3] == especies[3].id
                  ? especies[3].nombrees
                  : especie[3] == especies[4].id
                  ? especies[4].nombrees
                  : especie[3] == especies[5].id
                  ? especies[5].nombrees
                  : ""
                : ""
              : especies && especie.length >= 4
              ? especie[3] == especies[0].id
                ? especies[0].nombrept
                : especie[3] == especies[1].id
                ? especies[1].nombrept
                : especie[3] == especies[2].id
                ? especies[2].nombrept
                : especie[3] == especies[3].id
                ? especies[3].nombrept
                : especie[3] == especies[4].id
                ? especies[4].nombrept
                : especie[3] == especies[5].id
                ? especies[5].nombrept
                : ""
              : ""}
            {especies && especie.length >= 5 ? ", " : ""}
            {language === "es"
              ? especies && especie.length >= 5
                ? especie[4] == especies[0].id
                  ? especies[0].nombrees
                  : especie[4] == especies[1].id
                  ? especies[1].nombrees
                  : especie[4] == especies[2].id
                  ? especies[2].nombrees
                  : especie[4] == especies[3].id
                  ? especies[3].nombrees
                  : especie[4] == especies[4].id
                  ? especies[4].nombrees
                  : especie[4] == especies[5].id
                  ? especies[5].nombrees
                  : ""
                : ""
              : especies && especie.length >= 5
              ? especie[4] == especies[0].id
                ? especies[0].nombrept
                : especie[4] == especies[1].id
                ? especies[1].nombrept
                : especie[4] == especies[2].id
                ? especies[2].nombrept
                : especie[4] == especies[3].id
                ? especies[3].nombrept
                : especie[4] == especies[4].id
                ? especies[4].nombrept
                : especie[4] == especies[5].id
                ? especies[5].nombrept
                : ""
              : ""}
            {especies && especie.length >= 6 ? ", " : ""}
            {language === "es"
              ? especies && especie.length >= 6
                ? especie[5] == especies[0].id
                  ? especies[0].nombrees
                  : especie[5] == especies[1].id
                  ? especies[1].nombrees
                  : especie[5] == especies[2].id
                  ? especies[2].nombrees
                  : especie[5] == especies[3].id
                  ? especies[3].nombrees
                  : especie[5] == especies[4].id
                  ? especies[4].nombrees
                  : especie[5] == especies[5].id
                  ? especies[5].nombrees
                  : ""
                : ""
              : especies && especie.length >= 6
              ? especie[5] == especies[0].id
                ? especies[0].nombrept
                : especie[5] == especies[1].id
                ? especies[1].nombrept
                : especie[5] == especies[2].id
                ? especies[2].nombrept
                : especie[5] == especies[3].id
                ? especies[3].nombrept
                : especie[5] == especies[4].id
                ? especies[4].nombrept
                : especie[5] == especies[5].id
                ? especies[5].nombrept
                : ""
              : ""}
          </Text>
          <Text style={styles.titleh3}>
            {language === "es"
              ? "Detalles de Especie:"
              : "Detalhes da Espécie:"}{" "}
            {detallesEspecies.map((l, i) =>
              l.id == initialState.detallesEspecies[0] ||
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
              l.id == initialState.detallesEspecies[17]
                ? language === "es"
                  ? l.nombrees + ", "
                  : l.nombrept + ", "
                : ""
            )}
          </Text>
          {intereses ? (
            <Text style={styles.titleh3}>
              {language === "es" ? "Mis intereses: " : "Meus interesses: "}{" "}
              {intereses.map((l, i) =>
                l.id == initialState.misIntereses[0] ||
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
                l.id == initialState.misIntereses[14] ||
                l.id == initialState.misIntereses[15] ||
                l.id == initialState.misIntereses[16] ||
                l.id == initialState.misIntereses[17]
                  ? language === "es"
                    ? l.name + ", "
                    : l.acf.name_pt + ", "
                  : ""
              )}
            </Text>
          ) : (
            <View></View>
          )}
        </View>
      ) : (
        <View></View>
      )}

      {
        //<Text>{initialState.misIntereses}</Text> si lo quitas puedes ver los datos que cargas
      }

      {/*<FlatList
        data={intereses}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("intereses", {
                id: item.id,
                name: item.name,
                color: item.acf.color,
              })
            }
          >
            <View
              style={{
                backgroundColor: item.acf.color,
                margin: 5,
                marginHorizontal: 30,
                borderRadius: 15,
                paddingVertical: 20,
              }}
            >
              <Text style={styles.titleIntereses}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={<View style={{ paddingBottom: 200 }}></View>}
            />*/}

      <Button
        title="Editar Perfil"
        buttonStyle={styles.btnStyle}
        onPress={() => {
          navigation.navigate("edit-profile");
        }}
      />
      <Button
        title={language === "es" ? "Cambiar Intereses" : "Alterar Interesse"}
        buttonStyle={styles.btnStyle}
        onPress={() => {
          navigation.navigate("select-intereses-account");
        }}
      />
      <Button
        title={language === "es" ? "Cambiar Especies" : "Alterar Espécies"}
        buttonStyle={styles.btnStyle}
        onPress={() => {
          navigation.navigate("select-especies");
        }}
      />
      <Button
        title={
          language === "es"
            ? "Cambiar Detalles Especies"
            : "Alterar Detalhes da Espécie"
        }
        buttonStyle={styles.btnStyle}
        onPress={() => {
          navigation.navigate("select-detalles-especies");
        }}
      />
      <Button
        title={language === "es" ? "Crear Canal" : "Criar canal"}
        buttonStyle={styles.btnStyle}
        onPress={() => {
          Linking.openURL(
            `https://socialagri.com/agriFM/es/perfil/?token=${base64.encode(
              initialState.userID
            )}`
          );
        }}
      />

      <Button
        title={language === "es" ? "CERRAR SESIÓN" : "FECHAR SESSÃO"}
        buttonStyle={styles.btnStyleCerrar}
        onPress={() => {
          (initialState.userID = "invitado"),
            (initialState.username = ""),
            (initialState.userImage = ""),
            (initialState.isAuthorized = false),
            (initialState.misIntereses = []),
            (initialState.favoritosCanales = []),
            (initialState.favoritosPodcast = []),
            DeviceEventEmitter.emit("userInvitado", {
              cancion: null,
            });
          DeviceEventEmitter.emit("cleanEmailPassword", {
            clean: "",
          });
          SecureStore.deleteItemAsync("email");
          SecureStore.deleteItemAsync("password");
          SecureStore.deleteItemAsync("language");
          navigation.navigate("log");
          console.log("Cerrando sesión...");
        }}
        containerStyle={{ marginTop: 30 }}
      />
      <View style={{ height: 160 }}></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#422c5e",
    paddingHorizontal: 20,
  },
  image: {
    height: 100,
    width: "100%",
    marginBottom: 40,
    marginTop: 40,
  },
  title: {
    fontSize: 25,
    color: "#ffffff",
    marginTop: 10,
    marginBottom: 20,
    fontWeight: "bold",
  },
  titleh2: {
    fontSize: 20,
    color: "#ffffff",
    marginBottom: 20,
    fontWeight: "bold",
  },
  titleh3: {
    fontSize: 15,
    color: "#ffffff",
    marginBottom: 15,
  },
  btnStyle: {
    backgroundColor: "#93bf22",
    height: 50,
    borderBottomColor: "#ffffff",
    borderBottomWidth: 1,
  },
  btnStyleCerrar: {
    //paddingTop: 40,
    backgroundColor: "#F64141",
    height: 50,
    width: "80%",
    alignSelf: "center",
  },
  btnEdit: {
    backgroundColor: "#93bf22",
    height: 30,
  },
});
