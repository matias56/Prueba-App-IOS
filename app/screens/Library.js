import { useNavigation, useFocusEffect } from "@react-navigation/native";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Image,
  Alert,
  DeviceEventEmitter,
  Platform,
} from "react-native";
import { Button, Avatar, ListItem, Divider } from "react-native-elements";
import { SvgCssUri } from "react-native-svg";
import initialState from "../utils/user";
import lang from "../utils/language";
import Loading from "../components/Loading";
import axios from "axios";
import RenderHtml from "react-native-render-html";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default function Library(props) {
  const navigation = useNavigation();
  const [language, setLanguage] = useState(lang.idioma);
  const [loading, setLoading] = useState(true);
  const [typeResults, setTypeResults] = useState("2");
  const [favoritesUpdateCanales, setFavoritesUpdateCanales] = useState(
    initialState.favoritosCanales
  );
  const [favoritesUpdatePodcast, setFavoritesUpdatePodcast] = useState(
    initialState.favoritosPodcast
  );

  useFocusEffect(
    useCallback(() => {
      setLanguage(lang.idioma);
    }, [lang])
  );

  useFocusEffect(
    useCallback(() => {
      setFavoritesUpdateCanales(initialState.favoritosCanales);
      setFavoritesUpdatePodcast(initialState.favoritosPodcast);
    }, [initialState])
  );

  useEffect(() => {
    setLoading(true);
    postCanales();
    postPodcast();
  }, [language, favoritesUpdateCanales, favoritesUpdatePodcast]);

  useEffect(() => {
    nombreCanales();
  }, []);

  const [canales, setCanales] = useState();
  //URL: la URL de tu endpoint API
  function postCanales() {
    const response = fetch(
      `https://socialagri.com/agriFM/wp-json/wp/v2/canales/?lang=${language}&per_page=100`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((response) => response.json())
      .then((responseJson) => {
        //alert(JSON.stringify(responseJson));
        //console.log(typeof responseJson);
        setCanales(responseJson);
        //console.log(responseJson);
        setLoading(false);
        //console.log(responseJson)//sale undefined quitar .results
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

  const [podcast, setPodcast] = useState();
  //URL: la URL de tu endpoint API
  function postPodcast() {
    //`https://socialagri.com/agriFM/wp-json/wp/v2/podcast/?lang=${language}&per_page=100`,  fetch

    const response = fetch(
      `https://socialagri.com/agriFM/wp-json/wp/v2/podcast/?lang=${language}&per_page=100`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((response) => response.json())
      .then((responseJson) => {
        //alert(JSON.stringify(responseJson));
        //console.log(typeof responseJson);
        setPodcast(responseJson);
        console.log(responseJson);
        setLoading(false);

        //console.log(responseJson)//sale undefined quitar .results
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

  const ItemViewCanal = ({ item }) => {
    return (
      <View style={{ marginBottom: 10 }}>
        <TouchableOpacity
          onPress={
            () =>
              navigation.navigate("canales", {
                id: item.id,
                name: item.name,
                image: item.acf.imagen_perfil,
                idUser: initialState.userID,
              })

            //("canales", {
            //  id: item.id,
            //  name: item.name,
            //  image: item.acf.imagen_perfil,
            //  idUser: initialState.userID,
            //})
          }
        >
          <View>
            <View>
              <Avatar
                source={{ uri: item.acf.imagen_perfil }}
                size={60}
                rounded
                containerStyle={{ alignSelf: "center" }}
              />
            </View>
            <Text style={styles.titleChannel}>{item.name}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const removePodcast = (valueID) => {
    axios
      .get(
        `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/remove-libraryp.php?id_user=${initialState.userID}&id_podcast=${valueID}`
      )
      .then(function (response) {
        // handle success
        console.log(JSON.stringify(response.data[0]));
        initialState.favoritosPodcast = response.data[0].favoritos_podcast;

        if (initialState.favoritosPodcast === null) {
          // establece un array vació si no hay podcast favoritos
          initialState.favoritosPodcast = [];
        } else if (!initialState.favoritosPodcast) {
          initialState.favoritosPodcast = [];
        }
        setFavoritesUpdatePodcast(initialState.favoritosPodcast);
        DeviceEventEmitter.emit("library", {
          favoritosPodcast: initialState.favoritosPodcast,
        });
      })

      .then(function () { });
  };

  const removeCanal = (valueID) => {
    axios
      .get(
        `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/remove-libraryc.php?id_user=${initialState.userID}&id_canal=${valueID}`
      )
      .then(function (response) {
        // handle success
        console.log(JSON.stringify(response.data[0]));
        initialState.favoritosCanales = response.data[0].favoritos_canales;
        if (initialState.favoritosCanales === null) {
          // establece un array vació si no hay canales favoritos
          initialState.favoritosCanales = [];
        } else if (!initialState.favoritosCanales) {
          initialState.favoritosCanales = [];
        }
        setFavoritesUpdateCanales(initialState.favoritosCanales);
      })

      .then(function () { });
  };

  function onLongPressCanal(value, id) {
    return Alert.alert(
      language === "es"
        ? `¿Quieres borrar el siguiente canal de tu biblioteca?`
        : `Deseja excluir o seguinte canal da sua biblioteca?`,
      `${value}`,
      //`${id}`,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: () => removeCanal(id) },
      ]
    );
  }

  function onLongPressPodcast(value, id) {
    return Alert.alert(
      language === "es"
        ? `¿Quieres borrar el siguiente podcast de tu biblioteca? `
        : `Deseja excluir o seguinte canal da sua biblioteca?`,
      `${value}`,
      //`${id}`,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: () => removePodcast(id) },
      ]
    );
  }

  const [nameCanal, setNameCanal] = useState([]);

  //URL: la URL de tu endpoint API
  function nombreCanales() {
    const response = fetch(
      `https://socialagri.com/agriFM/wp-json/wp/v2/canales/?lang=es&per_page=100`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((response) => response.json())
      .then((responseJson) => {
        //alert(JSON.stringify(responseJson));
        //console.log(typeof responseJson);

        setNameCanal(responseJson); //sale undefined quitar .results

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

  function obtenNombreCanal(value) {
    for (let i = 0; i < nameCanal.length; i++) {
      if (value == nameCanal[i].id) {
        return nameCanal[i].name;
      }
    }
  }

  return !initialState.isAuthorized ? (
    <ScrollView
      centerContent={true}
      contentContainerStyle={{
        marginTop: 30,
      }}
      style={styles.viewBody}
    >
      <SvgCssUri
        style={{ width: 150, height: 75, alignSelf: "center", marginTop: 20 }}
        uri="./assets/img/Logo.png"
      />
      <Image
        source={require("../../assets/img/user-guest.jpg")}
        resizeMode="contain"
        style={styles.image}
      />
      <View
        centerContent={true}
        contentContainerStyle={{
          marginTop: 30,
        }}
        style={styles.viewBody}
      >
        <Text style={styles.title}>
          {language === "es"
            ? "Guarda tus podcasts favoritos"
            : "Salve seus podcasts favoritos"}
        </Text>
        <Text style={styles.description}>
          {language === "es"
            ? `Para guardar tus canales y podcast ${"\n"}favoritos debes registrarte`
            : `Para salvar seus canais e podcasts ${"\n"}favoritos, você deve se registrar`}
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
      </View>
    </ScrollView>
  ) : (
    <ScrollView
      centerContent={true}
      contentContainerStyle={{
        marginTop: Platform.OS === "android" ? 55 : 75,
      }}
      style={styles.viewBody}
    >
      <Avatar
        size="small"
        source={
          language === "es"
            ? require("../../assets/img/flag-spain.png")
            : require("../../assets/img/flag-brazil.png")
        }
        rounded
        onPress={() => {
          navigation.push("select-language");
        }}
        activeOpacity={0.7}
        containerStyle={{
          marginRight: 20,
          marginBottom: 20,
          alignSelf: "flex-end",
        }}
      />
      <Loading
        isVisible={loading}
        text={
          language === "es" ? "Cargando Podcast..." : "Carregando Podcast..."
        }
      />
      <View style={styles.libraryList}>
        <View style={{ flexDirection: "row" }}>
          <Text
            style={
              typeResults === "2"
                ? styles.titleContentActive
                : styles.titleContent
            }
            onPress={() => setTypeResults("2")}
          >
            PODCAST
          </Text>
          <Text
            style={
              typeResults === "1"
                ? styles.titleContentActive
                : styles.titleContent
            }
            onPress={() => setTypeResults("1")}
          >
            {language === "es" ? "CANALES" : "CANAIS"}
          </Text>
        </View>
      </View>
      {typeResults === "1" ? (
        canales && initialState.favoritosCanales.length !== 0 ? (
          <View
            style={{
              width: windowWidth,
            }}
          >
            {language === "es" ? (
              <Text style={styles.title}>Tus canales favoritos</Text>
            ) : (
              <Text style={styles.title}>Seus canais favoritos</Text>
            )}
            <View
              style={{
                flex: 1,
                width: windowWidth / 1.5,
                alignContent: "space-between",
              }}
            >
              {canales.map((l, i) =>
                l.id == favoritesUpdateCanales[0] ||
                  l.id == favoritesUpdateCanales[1] ||
                  l.id == favoritesUpdateCanales[2] ||
                  l.id == favoritesUpdateCanales[3] ||
                  l.id == favoritesUpdateCanales[4] ||
                  l.id == favoritesUpdateCanales[5] ||
                  l.id == favoritesUpdateCanales[6] ||
                  l.id == favoritesUpdateCanales[7] ||
                  l.id == favoritesUpdateCanales[8] ||
                  l.id == favoritesUpdateCanales[9] ||
                  l.id == favoritesUpdateCanales[10] ||
                  l.id == favoritesUpdateCanales[11] ||
                  l.id == favoritesUpdateCanales[12] ||
                  l.id == favoritesUpdateCanales[13] ||
                  l.id == favoritesUpdateCanales[14] ||
                  l.id == favoritesUpdateCanales[15] ||
                  l.id == favoritesUpdateCanales[16] ||
                  l.id == favoritesUpdateCanales[17] ||
                  l.id == favoritesUpdateCanales[18] ||
                  l.id == favoritesUpdateCanales[19] ||
                  l.id == favoritesUpdateCanales[20] ||
                  l.id == favoritesUpdateCanales[21] ||
                  l.id == favoritesUpdateCanales[22] ||
                  l.id == favoritesUpdateCanales[23] ||
                  l.id == favoritesUpdateCanales[24] ||
                  l.id == favoritesUpdateCanales[25] ||
                  l.id == favoritesUpdateCanales[26] ? (
                  <View
                    style={{
                      width: windowWidth,
                    }}
                  >
                    <ListItem
                      key={i}
                      onPress={() =>
                        navigation.navigate("canales", {
                          id:
                            l.id == favoritesUpdateCanales[0]
                              ? favoritesUpdateCanales[0]
                              : l.id == favoritesUpdateCanales[1]
                                ? favoritesUpdateCanales[1]
                                : l.id == favoritesUpdateCanales[2]
                                  ? favoritesUpdateCanales[2]
                                  : l.id == favoritesUpdateCanales[3]
                                    ? favoritesUpdateCanales[3]
                                    : l.id == favoritesUpdateCanales[4]
                                      ? favoritesUpdateCanales[4]
                                      : l.id == favoritesUpdateCanales[5]
                                        ? favoritesUpdateCanales[5]
                                        : l.id == favoritesUpdateCanales[6]
                                          ? favoritesUpdateCanales[6]
                                          : l.id == favoritesUpdateCanales[7]
                                            ? favoritesUpdateCanales[7]
                                            : l.id == favoritesUpdateCanales[8]
                                              ? favoritesUpdateCanales[8]
                                              : l.id == favoritesUpdateCanales[9]
                                                ? favoritesUpdateCanales[9]
                                                : l.id == favoritesUpdateCanales[10]
                                                  ? favoritesUpdateCanales[10]
                                                  : l.id == favoritesUpdateCanales[11]
                                                    ? favoritesUpdateCanales[11]
                                                    : l.id == favoritesUpdateCanales[12]
                                                      ? favoritesUpdateCanales[12]
                                                      : l.id == favoritesUpdateCanales[13]
                                                        ? favoritesUpdateCanales[13]
                                                        : l.id == favoritesUpdateCanales[14]
                                                          ? favoritesUpdateCanales[14]
                                                          : l.id == favoritesUpdateCanales[15]
                                                            ? favoritesUpdateCanales[15]
                                                            : l.id == favoritesUpdateCanales[16]
                                                              ? favoritesUpdateCanales[16]
                                                              : l.id == favoritesUpdateCanales[17]
                                                                ? favoritesUpdateCanales[17]
                                                                : l.id == favoritesUpdateCanales[18]
                                                                  ? favoritesUpdateCanales[18]
                                                                  : l.id == favoritesUpdateCanales[19]
                                                                    ? favoritesUpdateCanales[19]
                                                                    : l.id == favoritesUpdateCanales[20]
                                                                      ? favoritesUpdateCanales[20]
                                                                      : l.id == favoritesUpdateCanales[21]
                                                                        ? favoritesUpdateCanales[21]
                                                                        : l.id == favoritesUpdateCanales[22]
                                                                          ? favoritesUpdateCanales[22]
                                                                          : l.id == favoritesUpdateCanales[23]
                                                                            ? favoritesUpdateCanales[23]
                                                                            : l.id == favoritesUpdateCanales[24]
                                                                              ? favoritesUpdateCanales[24]
                                                                              : l.id == favoritesUpdateCanales[25]
                                                                                ? favoritesUpdateCanales[25]
                                                                                : favoritesUpdateCanales[26],

                          name: l.name,
                          image: l.acf.imagen_perfil,
                          idUser: initialState.userID,
                          description: l.description,
                        })
                      }
                      onLongPress={() =>
                        onLongPressCanal(
                          l.name,
                          l.id == favoritesUpdateCanales[0]
                            ? favoritesUpdateCanales[0]
                            : l.id == favoritesUpdateCanales[1]
                              ? favoritesUpdateCanales[1]
                              : l.id == favoritesUpdateCanales[2]
                                ? favoritesUpdateCanales[2]
                                : l.id == favoritesUpdateCanales[3]
                                  ? favoritesUpdateCanales[3]
                                  : l.id == favoritesUpdateCanales[4]
                                    ? favoritesUpdateCanales[4]
                                    : l.id == favoritesUpdateCanales[5]
                                      ? favoritesUpdateCanales[5]
                                      : l.id == favoritesUpdateCanales[6]
                                        ? favoritesUpdateCanales[6]
                                        : l.id == favoritesUpdateCanales[7]
                                          ? favoritesUpdateCanales[7]
                                          : l.id == favoritesUpdateCanales[8]
                                            ? favoritesUpdateCanales[8]
                                            : l.id == favoritesUpdateCanales[9]
                                              ? favoritesUpdateCanales[9]
                                              : l.id == favoritesUpdateCanales[10]
                                                ? favoritesUpdateCanales[10]
                                                : l.id == favoritesUpdateCanales[11]
                                                  ? favoritesUpdateCanales[11]
                                                  : l.id == favoritesUpdateCanales[12]
                                                    ? favoritesUpdateCanales[12]
                                                    : l.id == favoritesUpdateCanales[13]
                                                      ? favoritesUpdateCanales[13]
                                                      : l.id == favoritesUpdateCanales[14]
                                                        ? favoritesUpdateCanales[14]
                                                        : l.id == favoritesUpdateCanales[15]
                                                          ? favoritesUpdateCanales[15]
                                                          : l.id == favoritesUpdateCanales[16]
                                                            ? favoritesUpdateCanales[16]
                                                            : l.id == favoritesUpdateCanales[17]
                                                              ? favoritesUpdateCanales[17]
                                                              : l.id == favoritesUpdateCanales[18]
                                                                ? favoritesUpdateCanales[18]
                                                                : l.id == favoritesUpdateCanales[19]
                                                                  ? favoritesUpdateCanales[19]
                                                                  : l.id == favoritesUpdateCanales[20]
                                                                    ? favoritesUpdateCanales[20]
                                                                    : l.id == favoritesUpdateCanales[21]
                                                                      ? favoritesUpdateCanales[21]
                                                                      : l.id == favoritesUpdateCanales[22]
                                                                        ? favoritesUpdateCanales[22]
                                                                        : l.id == favoritesUpdateCanales[23]
                                                                          ? favoritesUpdateCanales[23]
                                                                          : l.id == favoritesUpdateCanales[24]
                                                                            ? favoritesUpdateCanales[24]
                                                                            : l.id == favoritesUpdateCanales[25]
                                                                              ? favoritesUpdateCanales[25]
                                                                              : favoritesUpdateCanales[26]
                        )
                      }
                      containerStyle={{
                        flex: 1,
                        flexDirection: "row",
                        flexWrap: "wrap",
                        //alignSelf: "center",
                        justifyContent: "center",
                        backgroundColor: "#422c5e",
                      }}
                    >
                      <View style={{ flexDirection: "row" }}>
                        <Avatar
                          source={{ uri: l.acf.imagen_perfil }}
                          size={60}
                          rounded
                          containerStyle={{
                            alignSelf: "center",

                            marginBottom: 10,
                          }}
                        />
                        <View style={{ flexDirection: "column" }}>
                          <ListItem.Title
                            style={styles.listPodcast}
                            onPress={() => console.log(Object.values(l.id))}
                          >
                            {l.name}
                          </ListItem.Title>
                          <ListItem.Title
                            style={{
                              fontSize: 12,
                              color: "#ffffff",
                              marginLeft: 10,
                              width: windowWidth / 1.5,
                              marginTop: -10,
                            }}
                          >
                            <RenderHtml
                              contentWidth={windowWidth / 1.5}
                              source={{
                                html: `
      <p style='color:#ffffff; font-size:12px; width:${windowWidth / 1.5}px; '>
      ${l.description.substr(0, 160)}
      ${"..."}
      </p>`,
                              }}
                            />
                          </ListItem.Title>
                        </View>
                      </View>
                      <Button
                        icon={{
                          name: "delete",
                          size: 25,
                          color: "#ffffff",
                        }}
                        title={
                          language === "es"
                            ? "Dejar de seguir"
                            : "Deixar de seguir"
                        }
                        buttonStyle={{
                          backgroundColor: "#594079",
                          borderRadius: 5,
                        }}
                        containerStyle={{
                          alignSelf: "center",
                          height: 40,
                          width: 250,
                        }}
                        onPress={() =>
                          onLongPressCanal(
                            l.name,
                            l.id == favoritesUpdateCanales[0]
                              ? favoritesUpdateCanales[0]
                              : l.id == favoritesUpdateCanales[1]
                                ? favoritesUpdateCanales[1]
                                : l.id == favoritesUpdateCanales[2]
                                  ? favoritesUpdateCanales[2]
                                  : l.id == favoritesUpdateCanales[3]
                                    ? favoritesUpdateCanales[3]
                                    : l.id == favoritesUpdateCanales[4]
                                      ? favoritesUpdateCanales[4]
                                      : l.id == favoritesUpdateCanales[5]
                                        ? favoritesUpdateCanales[5]
                                        : l.id == favoritesUpdateCanales[6]
                                          ? favoritesUpdateCanales[6]
                                          : l.id == favoritesUpdateCanales[7]
                                            ? favoritesUpdateCanales[7]
                                            : l.id == favoritesUpdateCanales[8]
                                              ? favoritesUpdateCanales[8]
                                              : l.id == favoritesUpdateCanales[9]
                                                ? favoritesUpdateCanales[9]
                                                : l.id == favoritesUpdateCanales[10]
                                                  ? favoritesUpdateCanales[10]
                                                  : l.id == favoritesUpdateCanales[11]
                                                    ? favoritesUpdateCanales[11]
                                                    : l.id == favoritesUpdateCanales[12]
                                                      ? favoritesUpdateCanales[12]
                                                      : l.id == favoritesUpdateCanales[13]
                                                        ? favoritesUpdateCanales[13]
                                                        : l.id == favoritesUpdateCanales[14]
                                                          ? favoritesUpdateCanales[14]
                                                          : l.id == favoritesUpdateCanales[15]
                                                            ? favoritesUpdateCanales[15]
                                                            : l.id == favoritesUpdateCanales[16]
                                                              ? favoritesUpdateCanales[16]
                                                              : l.id == favoritesUpdateCanales[17]
                                                                ? favoritesUpdateCanales[17]
                                                                : l.id == favoritesUpdateCanales[18]
                                                                  ? favoritesUpdateCanales[18]
                                                                  : l.id == favoritesUpdateCanales[19]
                                                                    ? favoritesUpdateCanales[19]
                                                                    : l.id == favoritesUpdateCanales[20]
                                                                      ? favoritesUpdateCanales[20]
                                                                      : l.id == favoritesUpdateCanales[21]
                                                                        ? favoritesUpdateCanales[21]
                                                                        : l.id == favoritesUpdateCanales[22]
                                                                          ? favoritesUpdateCanales[22]
                                                                          : l.id == favoritesUpdateCanales[23]
                                                                            ? favoritesUpdateCanales[23]
                                                                            : l.id == favoritesUpdateCanales[24]
                                                                              ? favoritesUpdateCanales[24]
                                                                              : l.id == favoritesUpdateCanales[25]
                                                                                ? favoritesUpdateCanales[25]
                                                                                : favoritesUpdateCanales[26]
                          )
                        }
                      />
                    </ListItem>
                    <Divider style={styles.divider} />
                  </View>
                ) : (
                  <View>{console.log("vacio")}</View>
                )
              )}

              {/*<FlatList
              data={canales}
              contentContainerStyle={styles.list}
              numColumns={3}
              columnWrapperStyle={styles.column}
              keyExtractor={({ id }, index) => id}
              key={"#"}
              renderItem={ItemViewCanal}
              style={{ width: windowWidth }}
              contentContainerStyle={{ paddingBottom: 180 }}
            />*/}
            </View>
          </View>
        ) : (
          <View>
            <Image
              source={require("../../assets/img/icon-alert.png")}
              resizeMode="contain"
              style={styles.image}
            />
            {language === "es" ? (
              <Text style={styles.title}>
                No tienes ningún canal {"\n"}agregado en tu lista
              </Text>
            ) : (
              <Text style={styles.title}>
                Não há nenhum canal {"\n"}adicionado à sua lista
              </Text>
            )}
          </View>
        )
      ) : podcast && initialState.favoritosPodcast.length !== 0 ? (
        <View
          style={{
            width: windowWidth,
          }}
        >
          {language === "es" ? (
            <Text style={styles.title}>Tus podcast favoritos</Text>
          ) : (
            <Text style={styles.title}>Seus podcast favoritos</Text>
          )}
          <View
            style={{
              flex: 1,
              width: windowWidth,
              alignContent: "space-between",
            }}
          >
            {podcast.map((l, i) =>
              l.id == favoritesUpdatePodcast[0] ||
                l.id == favoritesUpdatePodcast[1] ||
                l.id == favoritesUpdatePodcast[2] ||
                l.id == favoritesUpdatePodcast[3] ||
                l.id == favoritesUpdatePodcast[4] ||
                l.id == favoritesUpdatePodcast[5] ||
                l.id == favoritesUpdatePodcast[6] ||
                l.id == favoritesUpdatePodcast[7] ||
                l.id == favoritesUpdatePodcast[8] ||
                l.id == favoritesUpdatePodcast[9] ||
                l.id == favoritesUpdatePodcast[10] ||
                l.id == favoritesUpdatePodcast[11] ||
                l.id == favoritesUpdatePodcast[12] ||
                l.id == favoritesUpdatePodcast[13] ||
                l.id == favoritesUpdatePodcast[14] ||
                l.id == favoritesUpdatePodcast[15] ||
                l.id == favoritesUpdatePodcast[16] ||
                l.id == favoritesUpdatePodcast[17] ||
                l.id == favoritesUpdatePodcast[18] ||
                l.id == favoritesUpdatePodcast[19] ||
                l.id == favoritesUpdatePodcast[20] ||
                l.id == favoritesUpdatePodcast[21] ||
                l.id == favoritesUpdatePodcast[22] ||
                l.id == favoritesUpdatePodcast[23] ||
                l.id == favoritesUpdatePodcast[24] ||
                l.id == favoritesUpdatePodcast[25] ||
                l.id == favoritesUpdatePodcast[26] ? (
                <ListItem
                  key={i}
                  containerStyle={{
                    flex: 1,
                    flexDirection: "row",
                    flexWrap: "wrap",
                    //alignSelf: "center",
                    justifyContent: "center",
                    backgroundColor: "#422c5e",
                  }}
                  onPress={() =>
                    navigation.navigate("podcast", {
                      id:
                        l.id == favoritesUpdatePodcast[0]
                          ? favoritesUpdatePodcast[0]
                          : l.id == favoritesUpdatePodcast[1]
                            ? favoritesUpdatePodcast[1]
                            : l.id == favoritesUpdatePodcast[2]
                              ? favoritesUpdatePodcast[2]
                              : l.id == favoritesUpdatePodcast[3]
                                ? favoritesUpdatePodcast[3]
                                : l.id == favoritesUpdatePodcast[4]
                                  ? favoritesUpdatePodcast[4]
                                  : l.id == favoritesUpdatePodcast[5]
                                    ? favoritesUpdatePodcast[5]
                                    : l.id == favoritesUpdatePodcast[6]
                                      ? favoritesUpdatePodcast[6]
                                      : l.id == favoritesUpdatePodcast[7]
                                        ? favoritesUpdatePodcast[7]
                                        : l.id == favoritesUpdatePodcast[8]
                                          ? favoritesUpdatePodcast[8]
                                          : l.id == favoritesUpdatePodcast[9]
                                            ? favoritesUpdatePodcast[9]
                                            : l.id == favoritesUpdatePodcast[10]
                                              ? favoritesUpdatePodcast[10]
                                              : l.id == favoritesUpdatePodcast[11]
                                                ? favoritesUpdatePodcast[11]
                                                : l.id == favoritesUpdatePodcast[12]
                                                  ? favoritesUpdatePodcast[12]
                                                  : l.id == favoritesUpdatePodcast[13]
                                                    ? favoritesUpdatePodcast[13]
                                                    : l.id == favoritesUpdatePodcast[14]
                                                      ? favoritesUpdatePodcast[14]
                                                      : l.id == favoritesUpdatePodcast[15]
                                                        ? favoritesUpdatePodcast[15]
                                                        : l.id == favoritesUpdatePodcast[16]
                                                          ? favoritesUpdatePodcast[16]
                                                          : l.id == favoritesUpdatePodcast[17]
                                                            ? favoritesUpdatePodcast[17]
                                                            : l.id == favoritesUpdatePodcast[18]
                                                              ? favoritesUpdatePodcast[18]
                                                              : l.id == favoritesUpdatePodcast[19]
                                                                ? favoritesUpdatePodcast[19]
                                                                : l.id == favoritesUpdatePodcast[20]
                                                                  ? favoritesUpdatePodcast[20]
                                                                  : l.id == favoritesUpdatePodcast[21]
                                                                    ? favoritesUpdatePodcast[21]
                                                                    : l.id == favoritesUpdatePodcast[22]
                                                                      ? favoritesUpdatePodcast[22]
                                                                      : l.id == favoritesUpdatePodcast[23]
                                                                        ? favoritesUpdatePodcast[23]
                                                                        : l.id == favoritesUpdatePodcast[24]
                                                                          ? favoritesUpdatePodcast[24]
                                                                          : l.id == favoritesUpdatePodcast[25]
                                                                            ? favoritesUpdatePodcast[25]
                                                                            : favoritesUpdatePodcast[26],

                      name: l.title.rendered,
                      image: l.acf.imagen_podcast1,
                      categories: obtenNombreCanal(l.canales),
                      categoriesid: l.canales[0],
                      idUser: initialState.userID,
                      podcast: l.acf.link_podcast1,
                      interes: l.intereses[0],
                      description: l.yoast_head_json.og_description,
                      linkweb: l.link,
                    })
                  }
                  onLongPress={() =>
                    onLongPressPodcast(
                      l.title.rendered,
                      l.id == favoritesUpdatePodcast[0]
                        ? favoritesUpdatePodcast[0]
                        : l.id == favoritesUpdatePodcast[1]
                          ? favoritesUpdatePodcast[1]
                          : l.id == favoritesUpdatePodcast[2]
                            ? favoritesUpdatePodcast[2]
                            : l.id == favoritesUpdatePodcast[3]
                              ? favoritesUpdatePodcast[3]
                              : l.id == favoritesUpdatePodcast[4]
                                ? favoritesUpdatePodcast[4]
                                : l.id == favoritesUpdatePodcast[5]
                                  ? favoritesUpdatePodcast[5]
                                  : l.id == favoritesUpdatePodcast[6]
                                    ? favoritesUpdatePodcast[6]
                                    : l.id == favoritesUpdatePodcast[7]
                                      ? favoritesUpdatePodcast[7]
                                      : l.id == favoritesUpdatePodcast[8]
                                        ? favoritesUpdatePodcast[8]
                                        : l.id == favoritesUpdatePodcast[9]
                                          ? favoritesUpdatePodcast[9]
                                          : l.id == favoritesUpdatePodcast[10]
                                            ? favoritesUpdatePodcast[10]
                                            : l.id == favoritesUpdatePodcast[11]
                                              ? favoritesUpdatePodcast[11]
                                              : l.id == favoritesUpdatePodcast[12]
                                                ? favoritesUpdatePodcast[12]
                                                : l.id == favoritesUpdatePodcast[13]
                                                  ? favoritesUpdatePodcast[13]
                                                  : l.id == favoritesUpdatePodcast[14]
                                                    ? favoritesUpdatePodcast[14]
                                                    : l.id == favoritesUpdatePodcast[15]
                                                      ? favoritesUpdatePodcast[15]
                                                      : l.id == favoritesUpdatePodcast[16]
                                                        ? favoritesUpdatePodcast[16]
                                                        : l.id == favoritesUpdatePodcast[17]
                                                          ? favoritesUpdatePodcast[17]
                                                          : l.id == favoritesUpdatePodcast[18]
                                                            ? favoritesUpdatePodcast[18]
                                                            : l.id == favoritesUpdatePodcast[19]
                                                              ? favoritesUpdatePodcast[19]
                                                              : l.id == favoritesUpdatePodcast[20]
                                                                ? favoritesUpdatePodcast[20]
                                                                : l.id == favoritesUpdatePodcast[21]
                                                                  ? favoritesUpdatePodcast[21]
                                                                  : l.id == favoritesUpdatePodcast[22]
                                                                    ? favoritesUpdatePodcast[22]
                                                                    : l.id == favoritesUpdatePodcast[23]
                                                                      ? favoritesUpdatePodcast[23]
                                                                      : l.id == favoritesUpdatePodcast[24]
                                                                        ? favoritesUpdatePodcast[24]
                                                                        : l.id == favoritesUpdatePodcast[25]
                                                                          ? favoritesUpdatePodcast[25]
                                                                          : favoritesUpdatePodcast[26]
                    )
                  }
                >
                  <View style={{ flexDirection: "row" }}>
                    <Avatar
                      source={{ uri: l.acf.imagen_podcast1 }}
                      size={80}
                      containerStyle={{
                        alignSelf: "center",

                        marginBottom: 10,
                      }}
                    />
                    <View style={{ flexDirection: "column" }}>
                      <ListItem.Title style={styles.listPodcast}>
                        {obtenNombreCanal(l.canales)}
                      </ListItem.Title>
                      <ListItem.Title
                        style={{
                          fontSize: 12,
                          color: "#ffffff",
                          marginLeft: 10,

                          width: windowWidth / 1.5,
                          marginTop: -10,
                        }}
                      >
                        {
                          //l.title.rendered.substr(0, 160)
                        }
                        {
                          //"..."
                        }
                        <RenderHtml
                          contentWidth={windowWidth / 1.5}
                          source={{
                            html: `
      <p style='color:#ffffff; font-size:12px; width:${windowWidth / 1.5}px; '>
      ${l.title.rendered.substr(0, 160)}
      ${"..."}
      </p>`,
                          }}
                        />
                      </ListItem.Title>
                    </View>
                  </View>
                  <Button
                    icon={{
                      name: "delete",
                      size: 25,
                      color: "#ffffff",
                    }}
                    title={
                      language === "es"
                        ? "Eliminar de la biblioteca"
                        : "Eliminar a biblioteca"
                    }
                    buttonStyle={{
                      backgroundColor: "#594079",
                      borderRadius: 5,
                    }}
                    containerStyle={{
                      alignSelf: "center",
                      height: 40,
                      width: 250,
                    }}
                    onPress={() =>
                      onLongPressPodcast(
                        l.title.rendered,
                        l.id == favoritesUpdatePodcast[0]
                          ? favoritesUpdatePodcast[0]
                          : l.id == favoritesUpdatePodcast[1]
                            ? favoritesUpdatePodcast[1]
                            : l.id == favoritesUpdatePodcast[2]
                              ? favoritesUpdatePodcast[2]
                              : l.id == favoritesUpdatePodcast[3]
                                ? favoritesUpdatePodcast[3]
                                : l.id == favoritesUpdatePodcast[4]
                                  ? favoritesUpdatePodcast[4]
                                  : l.id == favoritesUpdatePodcast[5]
                                    ? favoritesUpdatePodcast[5]
                                    : l.id == favoritesUpdatePodcast[6]
                                      ? favoritesUpdatePodcast[6]
                                      : l.id == favoritesUpdatePodcast[7]
                                        ? favoritesUpdatePodcast[7]
                                        : l.id == favoritesUpdatePodcast[8]
                                          ? favoritesUpdatePodcast[8]
                                          : l.id == favoritesUpdatePodcast[9]
                                            ? favoritesUpdatePodcast[9]
                                            : l.id == favoritesUpdatePodcast[10]
                                              ? favoritesUpdatePodcast[10]
                                              : l.id == favoritesUpdatePodcast[11]
                                                ? favoritesUpdatePodcast[11]
                                                : l.id == favoritesUpdatePodcast[12]
                                                  ? favoritesUpdatePodcast[12]
                                                  : l.id == favoritesUpdatePodcast[13]
                                                    ? favoritesUpdatePodcast[13]
                                                    : l.id == favoritesUpdatePodcast[14]
                                                      ? favoritesUpdatePodcast[14]
                                                      : l.id == favoritesUpdatePodcast[15]
                                                        ? favoritesUpdatePodcast[15]
                                                        : l.id == favoritesUpdatePodcast[16]
                                                          ? favoritesUpdatePodcast[16]
                                                          : l.id == favoritesUpdatePodcast[17]
                                                            ? favoritesUpdatePodcast[17]
                                                            : l.id == favoritesUpdatePodcast[18]
                                                              ? favoritesUpdatePodcast[18]
                                                              : l.id == favoritesUpdatePodcast[19]
                                                                ? favoritesUpdatePodcast[19]
                                                                : l.id == favoritesUpdatePodcast[20]
                                                                  ? favoritesUpdatePodcast[20]
                                                                  : l.id == favoritesUpdatePodcast[21]
                                                                    ? favoritesUpdatePodcast[21]
                                                                    : l.id == favoritesUpdatePodcast[22]
                                                                      ? favoritesUpdatePodcast[22]
                                                                      : l.id == favoritesUpdatePodcast[23]
                                                                        ? favoritesUpdatePodcast[23]
                                                                        : l.id == favoritesUpdatePodcast[24]
                                                                          ? favoritesUpdatePodcast[24]
                                                                          : l.id == favoritesUpdatePodcast[25]
                                                                            ? favoritesUpdatePodcast[25]
                                                                            : favoritesUpdatePodcast[26]
                      )
                    }
                  />
                  <View style={styles.dividerPodcast}></View>
                </ListItem>
              ) : (
                <View>{console.log("vacio")}</View>
              )
            )}

            {/*<FlatList
              data={canales}
              contentContainerStyle={styles.list}
              numColumns={3}
              columnWrapperStyle={styles.column}
              keyExtractor={({ id }, index) => id}
              key={"#"}
              renderItem={ItemViewCanal}
              style={{ width: windowWidth }}
              contentContainerStyle={{ paddingBottom: 180 }}
            />*/}
          </View>
        </View>
      ) : (
        <View>
          <Image
            source={require("../../assets/img/icon-alert.png")}
            resizeMode="contain"
            style={styles.image}
          />
          {language === "es" ? (
            <Text style={styles.title}>
              No tienes ningún podcast {"\n"}agregado en tu lista
            </Text>
          ) : (
            <Text style={styles.title}>
              Não há nenhum podcast {"\n"}adicionado à sua lista
            </Text>
          )}
        </View>
      )}
      <View style={{ paddingBottom: 200 }}></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#422c5e",
    alignItems: "center",
    justifyContent: "center",
  },

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
  titleContent: {
    color: "#ba5efd",
    marginHorizontal: 20,
    marginBottom: 30,
    fontSize: 18,
    fontWeight: "bold",
  },
  titleContentActive: {
    color: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 30,
    fontSize: 18,
    fontWeight: "bold",
    borderBottomColor: "#ffffff",
    borderBottomWidth: 2,
  },
  libraryList: {
    width: windowWidth,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
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
  list: {
    justifyContent: "space-around",
  },
  column: {
    justifyContent: "space-evenly",
  },
  titleChannel: {
    flex: 1,
    color: "#ffffff",
    marginTop: 5,
    marginBottom: 10,
    textAlign: "center",
    alignSelf: "center",
    fontWeight: "bold",
    width: 130,
    fontSize: 11,
    width: 100,
  },
  divider: {
    backgroundColor: "#fff",
    marginTop: 20,
    margin: 10,
  },
  dividerPodcast: {
    backgroundColor: "#fff",
    height: 0.5,
    width: windowWidth - 20,
    marginTop: 40,
  },
  listPodcast: {
    marginLeft: 10,
    marginBottom: 5,
    color: "#94C123",
    fontWeight: "bold",
    fontSize: 15,
  },
});
