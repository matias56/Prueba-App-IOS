import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Share,
  DeviceEventEmitter,
  ImageBackground,
} from "react-native";

import { Icon, Image, Divider, Button } from "react-native-elements";
import Loading from "../../components/Loading";
import Toast from "react-native-root-toast";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import initialState from "../../utils/user";
import lang from "../../utils/language";
import axios from "axios";
import playPodcast from "../../utils/playsong";
import RenderHtml from "react-native-render-html";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default function Canales(props) {
  const { navigation, route } = props;
  const { id, name, image, idUser, description } = route.params;
  const [language, setLanguage] = useState(lang.idioma);
  console.log(route.params);

  ///////////// SHARE // FAVORITES // VIEWS

  const [podcastShare, setPodcastShare] = useState("");
  const [podcastName, setPodcastName] = useState("");
  const [favoritesUpdatePodcast, setFavoritesUpdatePodcast] = useState(
    initialState.favoritosPodcast
  );

  const [likeUpdatePodcast, setLikeUpdatePodcast] = useState(
    initialState.likes
  );

  const [leerMas, setLeerMas] = useState(false);

  const removePodcastLike = (valueID) => {
    if (initialState.userID === "invitado") {
      //usuario invitado
      Toast.show(
        language === "es"
          ? "Para utilizar esta función debe registrarse o iniciar sesión con su correo"
          : "Para usar esta função você deve se registrar ou fazer login com seu e-mail",
        {
          position: Toast.positions.CENTER,
        }
      );
    } else {
      axios
        .get(
          `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/remove-like-app.php?id_user=${initialState.userID}&id_podcast=${valueID}`
        )
        .then(function (response) {
          // handle success
          console.log(JSON.stringify(response.data[0]));
          initialState.likes = response.data[0].likes_podcast;

          if (initialState.likes === null) {
            // establece un array vació si no hay podcast favoritos
            initialState.likes = [];
          } else if (!initialState.likes) {
            initialState.likes = [];
          }
          setLikeUpdatePodcast(initialState.likes);
        })

        .then(function () {});
    }
  };

  const addPodcastLike = (valueID) => {
    if (initialState.userID === "invitado") {
      //usuario invitado
      Toast.show(
        language === "es"
          ? "Para utilizar esta función debe registrarse o iniciar sesión con su correo"
          : "Para usar esta função você deve se registrar ou fazer login com seu e-mail",
        {
          position: Toast.positions.CENTER,
        }
      );
    } else {
      axios
        .get(
          `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/add-like-app.php?id_user=${initialState.userID}&id_podcast=${valueID}`
        )
        .then(function (response) {
          // handle success
          console.log(JSON.stringify(response.data[0]));
          initialState.likes = response.data[0].likes_podcast;

          if (initialState.likes === null) {
            // establece un array vació si no hay podcast favoritos
            initialState.likes = [];
          } else if (!initialState.likes) {
            initialState.likes = [];
          }
          setLikeUpdatePodcast(initialState.likes);
        })

        .then(function () {});
    }
  };

  const [selectedPodcast, setSelectedPodcast] = useState(playPodcast.id);

  const actualizarPodcast = (id, name, image, categories, podcast, linkweb) => {
    playPodcast.id = id;
    playPodcast.name = name;
    playPodcast.image = image;
    playPodcast.categories = categories;
    playPodcast.podcast = podcast;
    setSelectedPodcast(playPodcast.id);
    DeviceEventEmitter.emit("reproduccion", {
      id,
      name,
      image,
      categories,
      podcast,
      linkweb,
    });
  };

  useEffect(() => {
    DeviceEventEmitter.addListener("podcastselect", (event) => {
      setSelectedPodcast(event.id);
      playPodcast.id = event.id;
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      setSelectedPodcast(playPodcast.id);
    }, [playPodcast.id])
  );

  useFocusEffect(
    useCallback(() => {
      setFavoritesUpdatePodcast(initialState.favoritosPodcast);
    }, [initialState])
  );

  const [loading, setLoading] = useState(true);

  const [isFollow, setIsFollow] = useState(false);

  navigation.setOptions({ title: name });

  useEffect(() => {
    for (let index = 0; index < initialState.favoritosCanales.length; index++) {
      if (id == initialState.favoritosCanales[index]) {
        setIsFollow(true);
      }
    }
  }, [initialState]);

  useEffect(() => {
    postCanales();
    nombreCanales();
    mostrarViews();
    mostrarFavoritos();
  }, []);

  useEffect(() => {
    if (podcastShare) {
      onShare();
    }
  }, [podcastShare]);

  function onShare() {
    //compartir podcast
    try {
      const result = Share.share({
        message:
          language === "es"
            ? `Te recomiendo que escuches este podcast de agriFM "${podcastName}"${"\n"}${podcastShare} `
            : `Eu recomendo que você ouça este podcast da agriFM "${podcastName}"${"\n"}${podcastShare} `,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          setPodcastShare("");
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        setPodcastShare("");
        // dismissed
      }
    } catch (error) {
      alert(
        language === "es"
          ? "No se ha podido compartir"
          : "Não foi possível compartilhar"
      );
    }
  }

  const [views, setViews] = useState([]);

  function mostrarViews() {
    //actualiza el numero de views por cada play
    axios
      .get(
        //`https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/views-app.php?id_podcast=${value}`
        `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/views-app.php`
      )
      .then(function (response) {
        // handle success

        for (let index = 0; index < response.data[0][0].length; index++) {
          const element = response.data[0][0][index].split(":");

          views.push(element);
        }

        //console.log(views);
      })
      .then(() => {
        //setViews(views.split(","));
        //console.log(views);
      });
  }

  function obtenTotalViews(value) {
    for (let i = 0; i < views.length; i++) {
      if (value == views[i][1]) {
        var numero = views[i][0];
        return numero;
      }
    }
  }

  const [favorites, setFavorites] = useState([]);

  function mostrarFavoritos() {
    axios
      .get(
        `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/favs-app.php`
      )
      .then(function (response) {
        // success

        for (let index = 0; index < response.data[0][0].length; index++) {
          const element = response.data[0][0][index].split(":");
          favorites.push(element);
        }
      })
      .then(() => {
        console.log(favorites);
      });
  }

  function obtenTotalFavoritos(value) {
    for (let i = 0; i < favorites.length; i++) {
      if (value == favorites[i][0]) {
        var favs = favorites[i][1];

        return favs;
      }
    }
  }

  const onSubmit = () => {
    if (initialState.userID === "invitado") {
      //usuario invitado
      Toast.show(
        language === "es"
          ? "Para utilizar esta función debe registrarse o iniciar sesión con su correo"
          : "Para usar esta função você deve se registrar ou fazer login com seu e-mail",
        {
          position: Toast.positions.CENTER,
        }
      );
    } else {
      if (idUser === "") {
        Toast.show(
          "Necesitas estar registrado para añadir el canal a tu biblioteca",
          {
            position: Toast.positions.CENTER,
          }
        );
      } else if (idUser && isFollow === false) {
        axios
          .get(
            `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/add-favc-app.php?id_user=${initialState.userID}&id_canal=${id}`
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
            setIsFollow(true);
            var guardar = lang.idioma; /////luego
          })

          .then(function () {});
      } else {
        axios
          .get(
            `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/remove-libraryc.php?id_user=${initialState.userID}&id_canal=${id}`
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
            setIsFollow(false);
          })

          .then(function () {});
      }
    }
  };

  const [listaCanales, setListaCanales] = useState([]);
  function postCanales() {
    const response = fetch(
      `https://socialagri.com/agriFM/${language}/wp-json/wp/v2/podcast?per_page=100&canales=${id}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((response) => response.json())
      .then((responseJson) => {
        setListaCanales(responseJson);
      })
      .catch((error) => {
        //console.error(error);
      });
  }

  const [nameCanal, setNameCanal] = useState([]);

  //URL: la URL de tu endpoint API
  function nombreCanales() {
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

        setNameCanal(responseJson); //sale undefined quitar .results
        setLoading(false);

        //acf.link_podcast1
        //acf.imagen_podcast1
        //title.rendered Titulo del podcast
        //yoast_head_json.og_description Descripcion del podcast
      })

      .catch((error) => {
        //Error
        //console.error(error);
      });
  }

  function obtenNombreCanal(value) {
    for (let i = 0; i < nameCanal.length; i++) {
      if (value == nameCanal[i].id) {
        var nombre = nameCanal[i].name;
        return nombre;
      }
    }
  }

  const removePodcast = (valueID) => {
    if (initialState.userID === "invitado") {
      //usuario invitado
      Toast.show(
        language === "es"
          ? "Para utilizar esta función debe registrarse o iniciar sesión con su correo"
          : "Para usar esta função você deve se registrar ou fazer login com seu e-mail",
        {
          position: Toast.positions.CENTER,
        }
      );
    } else {
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

        .then(function () {});
    }
  };

  const addPodcast = (valueID) => {
    if (initialState.userID === "invitado") {
      //usuario invitado
      Toast.show(
        language === "es"
          ? "Para utilizar esta función debe registrarse o iniciar sesión con su correo"
          : "Para usar esta função você deve se registrar ou fazer login com seu e-mail",
        {
          position: Toast.positions.CENTER,
        }
      );
    } else {
      axios
        .get(
          `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/add-favp-app.php?id_user=${initialState.userID}&id_podcast=${valueID}`
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

        .then(function () {});
    }
  };

  const ItemView = ({ item }) => {
    return (
      <View style={{ color: "#594079", marginBottom: 20, width: windowWidth }}>
        <View>
          <View style={{ flexDirection: "row" }}>
            <Image
              source={{ uri: item.acf.imagen_podcast1 }}
              style={{ width: 80, height: 80, margin: 10 }}
              PlaceholderContent={<ActivityIndicator />}
              onPress={() =>
                navigation.navigate("podcast", {
                  id: item.id,
                  name: item.title.rendered,
                  image: item.acf.imagen_podcast1,
                  categories: obtenNombreCanal(item.canales),
                  categoriesid: item.canales[0],
                  podcast: item.acf.link_podcast1,
                  interes: item.intereses[0],
                  description: item.yoast_head_json.og_description,
                  linkweb: item.link,
                })
              }
            />
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                <Text
                  style={styles.listPodcast}
                  onPress={() =>
                    navigation.navigate("podcast", {
                      id: item.id,
                      name: item.title.rendered,
                      image: item.acf.imagen_podcast1,
                      categories: obtenNombreCanal(item.canales),
                      categoriesid: item.canales[0],
                      podcast: item.acf.link_podcast1,
                      interes: item.intereses[0],
                      description: item.yoast_head_json.og_description,
                      linkweb: item.link,
                    })
                  }
                >
                  {obtenNombreCanal(item.canales)}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("podcast", {
                    id: item.id,
                    name: item.title.rendered,
                    image: item.acf.imagen_podcast1,
                    categories: obtenNombreCanal(item.canales),
                    categoriesid: item.canales[0],
                    podcast: item.acf.link_podcast1,
                    interes: item.intereses[0],
                    description: item.yoast_head_json.og_description,
                    linkweb: item.link,
                  })
                }
                activeOpacity={1}
              >
                <RenderHtml
                  contentWidth={windowWidth}
                  source={{
                    html: `
      <p style='text-align:left; margin: 5px; color:#ffffff'>
        <strong>${item.title.rendered}</strong>
      </p>`,
                  }}
                />
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: "row",
                }}
              >
                <Icon
                  type="material-community"
                  name="share-variant"
                  onPress={() => {
                    setPodcastName(item.title.rendered);
                    setPodcastShare(item.link);
                  }}
                  color="#ffffff"
                  size={40}
                  underlayColor="transparent"
                  containerStyle={{ width: 40, margin: 5 }}
                />

                {item.id == likeUpdatePodcast[0] ||
                item.id == likeUpdatePodcast[1] ||
                item.id == likeUpdatePodcast[2] ||
                item.id == likeUpdatePodcast[3] ||
                item.id == likeUpdatePodcast[4] ||
                item.id == likeUpdatePodcast[5] ||
                item.id == likeUpdatePodcast[6] ||
                item.id == likeUpdatePodcast[7] ||
                item.id == likeUpdatePodcast[8] ||
                item.id == likeUpdatePodcast[9] ||
                item.id == likeUpdatePodcast[10] ||
                item.id == likeUpdatePodcast[11] ||
                item.id == likeUpdatePodcast[12] ||
                item.id == likeUpdatePodcast[13] ||
                item.id == likeUpdatePodcast[14] ||
                item.id == likeUpdatePodcast[15] ||
                item.id == likeUpdatePodcast[16] ||
                item.id == likeUpdatePodcast[17] ||
                item.id == likeUpdatePodcast[18] ||
                item.id == likeUpdatePodcast[19] ||
                item.id == likeUpdatePodcast[20] ||
                item.id == likeUpdatePodcast[21] ||
                item.id == likeUpdatePodcast[22] ||
                item.id == likeUpdatePodcast[23] ||
                item.id == likeUpdatePodcast[24] ||
                item.id == likeUpdatePodcast[25] ||
                item.id == likeUpdatePodcast[26] ||
                item.id == likeUpdatePodcast[27] ||
                item.id == likeUpdatePodcast[28] ||
                item.id == likeUpdatePodcast[29] ||
                item.id == likeUpdatePodcast[30] ||
                item.id == likeUpdatePodcast[31] ||
                item.id == likeUpdatePodcast[32] ||
                item.id == likeUpdatePodcast[33] ||
                item.id == likeUpdatePodcast[34] ||
                item.id == likeUpdatePodcast[35] ||
                item.id == likeUpdatePodcast[36] ||
                item.id == likeUpdatePodcast[37] ||
                item.id == likeUpdatePodcast[38] ||
                item.id == likeUpdatePodcast[39] ||
                item.id == likeUpdatePodcast[40] ||
                item.id == likeUpdatePodcast[41] ||
                item.id == likeUpdatePodcast[42] ||
                item.id == likeUpdatePodcast[43] ||
                item.id == likeUpdatePodcast[44] ||
                item.id == likeUpdatePodcast[45] ||
                item.id == likeUpdatePodcast[46] ||
                item.id == likeUpdatePodcast[47] ||
                item.id == likeUpdatePodcast[48] ||
                item.id == likeUpdatePodcast[49] ||
                item.id == likeUpdatePodcast[50] ||
                item.id == likeUpdatePodcast[51] ||
                item.id == likeUpdatePodcast[52] ||
                item.id == likeUpdatePodcast[53] ||
                item.id == likeUpdatePodcast[54] ||
                item.id == likeUpdatePodcast[55] ||
                item.id == likeUpdatePodcast[56] ||
                item.id == likeUpdatePodcast[57] ||
                item.id == likeUpdatePodcast[58] ||
                item.id == likeUpdatePodcast[59] ||
                item.id == likeUpdatePodcast[60] ||
                item.id == likeUpdatePodcast[61] ||
                item.id == likeUpdatePodcast[62] ||
                item.id == likeUpdatePodcast[63] ||
                item.id == likeUpdatePodcast[64] ||
                item.id == likeUpdatePodcast[65] ||
                item.id == likeUpdatePodcast[66] ||
                item.id == likeUpdatePodcast[67] ||
                item.id == likeUpdatePodcast[68] ||
                item.id == likeUpdatePodcast[69] ||
                item.id == likeUpdatePodcast[70] ||
                item.id == likeUpdatePodcast[71] ||
                item.id == likeUpdatePodcast[72] ||
                item.id == likeUpdatePodcast[73] ||
                item.id == likeUpdatePodcast[74] ||
                item.id == likeUpdatePodcast[75] ||
                item.id == likeUpdatePodcast[76] ||
                item.id == likeUpdatePodcast[77] ||
                item.id == likeUpdatePodcast[78] ||
                item.id == likeUpdatePodcast[79] ||
                item.id == likeUpdatePodcast[80] ||
                item.id == likeUpdatePodcast[81] ||
                item.id == likeUpdatePodcast[82] ||
                item.id == likeUpdatePodcast[83] ||
                item.id == likeUpdatePodcast[84] ||
                item.id == likeUpdatePodcast[85] ||
                item.id == likeUpdatePodcast[86] ||
                item.id == likeUpdatePodcast[87] ||
                item.id == likeUpdatePodcast[88] ||
                item.id == likeUpdatePodcast[89] ||
                item.id == likeUpdatePodcast[90] ||
                item.id == likeUpdatePodcast[91] ||
                item.id == likeUpdatePodcast[92] ||
                item.id == likeUpdatePodcast[93] ||
                item.id == likeUpdatePodcast[94] ||
                item.id == likeUpdatePodcast[95] ||
                item.id == likeUpdatePodcast[96] ||
                item.id == likeUpdatePodcast[97] ||
                item.id == likeUpdatePodcast[98] ||
                item.id == likeUpdatePodcast[99] ||
                item.id == likeUpdatePodcast[100] ? (
                  <View style={{ flexDirection: "row" }}>
                    <Icon
                      type="fontisto"
                      name="like"
                      color="#9a4dff"
                      size={30}
                      underlayColor="transparent"
                      containerStyle={{
                        width: 40,
                        margin: 5,
                        marginTop: 9,
                      }}
                      onPress={() => removePodcastLike(item.id)}
                    />
                    <Text
                      style={{
                        color: "#ffffff",
                        marginLeft: -2,
                        fontSize: 15,
                      }}
                    >
                      {
                        //mostrarViews(item.id)
                        `${
                          obtenTotalFavoritos(item.id) == undefined
                            ? 1
                            : parseInt(obtenTotalFavoritos(item.id)) + 1
                        }`
                      }
                    </Text>
                    {!obtenTotalFavoritos(item.id) ? (
                      <Text
                        style={{
                          color: "#ffffff",
                          marginLeft: -2,
                          fontSize: 15,
                        }}
                      >
                        {
                          //mostrarViews(item.id)
                          `${
                            obtenTotalFavoritos(item.id) == undefined
                              ? ""
                              : parseInt(obtenTotalFavoritos(item.id)) + 1
                          }`
                        }
                      </Text>
                    ) : (
                      <Text></Text>
                    )}
                  </View>
                ) : (
                  <View style={{ flexDirection: "row" }}>
                    <Icon
                      type="fontisto"
                      name="like"
                      color="#ffffff"
                      size={30}
                      underlayColor="transparent"
                      containerStyle={{
                        width: 40,
                        margin: 5,
                        marginTop: 9,
                      }}
                      onPress={() => addPodcastLike(item.id)}
                    />
                    <Text
                      style={{
                        color: "#ffffff",
                        marginLeft: -2,
                        fontSize: 15,
                      }}
                    >
                      {
                        //mostrarViews(item.id)
                        obtenTotalFavoritos(item.id)
                      }
                    </Text>
                    {!obtenTotalFavoritos(item.id) ? (
                      <Text
                        style={{
                          color: "#ffffff",
                          marginLeft: -2,
                          fontSize: 15,
                        }}
                      >
                        0
                      </Text>
                    ) : (
                      <Text></Text>
                    )}
                  </View>
                )}
              </View>
            </View>
            <View style={{ paddingTop: 20 }}>
              {selectedPodcast != item.id ? (
                <View>
                  <Icon
                    type="material-icons"
                    name="play-circle-outline"
                    onPress={
                      () => {
                        actualizarPodcast(
                          item.id,
                          item.title.rendered,
                          item.acf.imagen_podcast1,
                          obtenNombreCanal(item.canales),
                          item.acf.link_podcast1,
                          item.link
                        );
                      }

                      //console.log("reproduciendo podcast");
                      //actualizarViews();
                      //setpodcastID(item.id);
                    }
                    color="#94C123"
                    size={50}
                    underlayColor="transparent"
                    containerStyle={{ marginRight: 10 }}
                  />
                  <View
                    style={{
                      flexDirection: "row",
                      marginLeft: -18,
                      alignContent: "center",
                    }}
                  >
                    <Icon
                      type="material-community"
                      name="volume-high"
                      color="#ffffff"
                      size={15}
                      underlayColor="transparent"
                      containerStyle={{ width: 40, margin: 5 }}
                    />
                    <Text
                      style={{
                        color: "#ffffff",
                        marginLeft: -12,
                        fontSize: 12,
                        textAlign: "center",
                        marginTop: 3,
                      }}
                    >
                      {
                        //mostrarViews(item.id)
                        obtenTotalViews(item.id)
                      }
                    </Text>
                    {!obtenTotalViews(item.id) ? (
                      <Text
                        style={{
                          color: "#ffffff",
                          fontSize: 12,
                          marginTop: 3,
                        }}
                      >
                        {
                          //mostrarViews(item.id)
                          0
                        }
                      </Text>
                    ) : (
                      <View></View>
                    )}
                  </View>
                </View>
              ) : (
                <View>
                  <Text
                    style={{
                      color: "#94C123",
                      textAlign: "center",
                      marginRight: 8,
                      fontWeight: "bold",
                      fontSize: 11,
                      marginTop: 11,
                    }}
                  >
                    {language === "es" ? "Escuchando" : "Escutando"}
                  </Text>
                  <Text
                    style={{
                      color: "#94C123",
                      textAlign: "center",

                      fontWeight: "bold",
                      fontSize: 11,
                    }}
                  >
                    {language === "es" ? "Ahora..." : "Agora..."}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 10,
                      alignContent: "center",
                    }}
                  >
                    <Icon
                      type="material-community"
                      name="volume-high"
                      color="#ffffff"
                      size={15}
                      underlayColor="transparent"
                      containerStyle={{
                        width: 40,
                        margin: 5,
                        marginLeft: -5,
                      }}
                    />
                    <Text
                      style={{
                        color: "#ffffff",
                        marginLeft: -12,
                        fontSize: 12,
                        textAlign: "center",
                        marginTop: 3,
                      }}
                    >
                      {
                        //mostrarViews(item.id)
                        obtenTotalViews(item.id)
                      }
                    </Text>
                    {!obtenTotalViews(item.id) ? (
                      <Text
                        style={{
                          color: "#ffffff",

                          fontSize: 12,
                          marginTop: 3,
                        }}
                      >
                        {
                          //mostrarViews(item.id)
                          0
                        }
                      </Text>
                    ) : (
                      <View></View>
                    )}
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
        <View style={{ margin: 10 }}>
          {item.id == favoritesUpdatePodcast[0] ||
          item.id == favoritesUpdatePodcast[1] ||
          item.id == favoritesUpdatePodcast[2] ||
          item.id == favoritesUpdatePodcast[3] ||
          item.id == favoritesUpdatePodcast[4] ||
          item.id == favoritesUpdatePodcast[5] ||
          item.id == favoritesUpdatePodcast[6] ||
          item.id == favoritesUpdatePodcast[7] ||
          item.id == favoritesUpdatePodcast[8] ||
          item.id == favoritesUpdatePodcast[9] ||
          item.id == favoritesUpdatePodcast[10] ||
          item.id == favoritesUpdatePodcast[11] ||
          item.id == favoritesUpdatePodcast[12] ||
          item.id == favoritesUpdatePodcast[13] ||
          item.id == favoritesUpdatePodcast[14] ||
          item.id == favoritesUpdatePodcast[15] ||
          item.id == favoritesUpdatePodcast[16] ||
          item.id == favoritesUpdatePodcast[17] ||
          item.id == favoritesUpdatePodcast[18] ||
          item.id == favoritesUpdatePodcast[19] ||
          item.id == favoritesUpdatePodcast[20] ||
          item.id == favoritesUpdatePodcast[21] ||
          item.id == favoritesUpdatePodcast[22] ||
          item.id == favoritesUpdatePodcast[23] ||
          item.id == favoritesUpdatePodcast[24] ||
          item.id == favoritesUpdatePodcast[25] ||
          item.id == favoritesUpdatePodcast[26] ? (
            <Button
              icon={{
                name: "playlist-play",
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
              onPress={() => {
                removePodcast(item.id);
              }}
            />
          ) : (
            <Button
              icon={{
                name: "playlist-play",
                size: 25,
                color: "#ffffff",
              }}
              title={
                language === "es"
                  ? "Añadir a la biblioteca"
                  : "Adicionar a biblioteca"
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
              onPress={() => {
                addPodcast(item.id);
              }}
            />
          )}
        </View>
        <Divider style={styles.divider} />
      </View>
    );
  };

  const backgroundImage = {
    uri: image,
  };

  return (
    <View style={styles.container}>
      <Loading isVisible={loading} text="Cargando Podcast..." />

      <FlatList
        data={listaCanales}
        keyExtractor={({ id }, index) => id}
        // evita el error de los cambios de columnas
        //  ItemSeparatorComponent={ItemSeparatorView}
        renderItem={ItemView}
        contentContainerStyle={{ paddingBottom: 150 }}
        ListHeaderComponent={
          <View
            style={{
              paddingBottom: 20,
              backgroundColor: "#000000",
              height: !leerMas ? 320 : 620,
              marginBottom: 30,
            }}
          >
            <ImageBackground
              source={backgroundImage}
              style={{
                width: windowWidth,
                height: !leerMas ? 320 : 620,
                opacity: 0.15,
              }}
            ></ImageBackground>
            <View style={{ marginTop: !leerMas ? -280 : -580 }}>
              <Image
                source={{ uri: image }}
                style={{ width: 100, height: 100, margin: 10 }}
                PlaceholderContent={<ActivityIndicator />}
              />
              <TouchableOpacity style={styles.info} onPress={onSubmit}>
                {isFollow ? (
                  <Text style={styles.followOK}>
                    {language === "es" ? "SIGUIENDO" : "SEGUINDO"}
                  </Text>
                ) : (
                  <Text style={styles.follow}>
                    {language === "es" ? "SEGUIR EL CANAL" : "SIGA O CANAL"}
                  </Text>
                )}
                <Icon
                  type="material-community"
                  name={isFollow ? "heart" : "heart-outline"}
                  color="#fff"
                  containerStyle={styles.favorite}
                  underlayColor="transparent"
                  size={35}
                />
              </TouchableOpacity>
              {!leerMas ? (
                <RenderHtml
                  contentWidth={windowWidth}
                  source={{
                    html: `
      <p style='text-align:left; margin: 10px; color:#ffffff'>
        ${description.slice(0, 230)}${"..."}
      </p>`,
                  }}
                />
              ) : (
                <RenderHtml
                  contentWidth={windowWidth}
                  source={{
                    html: `
      <p style='text-align:left; margin: 10px; color:#ffffff'>
        ${description.slice(0, 1000)}${"..."}
      </p>`,
                  }}
                />
                //<Text style={styles.descriptiontext}>
                //  {description.slice(0, 230)}
                //  {"..."}
                //</Text>
                //<Text style={styles.descriptiontext}>
                //  {description.slice(0, 1000)}
                //  {"..."}
                //</Text>
              )}
            </View>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => setLeerMas(!leerMas)}
            >
              <Text style={{ color: "#fff" }}>
                {!leerMas
                  ? language === "es"
                    ? "Leer más"
                    : "Ler mais"
                  : language === "es"
                  ? "Ocultar"
                  : "Ocultar"}
              </Text>
              <Icon
                type="material-community"
                name="plus-circle"
                color="#ffffff"
                size={35}
                underlayColor="transparent"
                containerStyle={{ width: 50, margin: 5 }}
              />
            </TouchableOpacity>
          </View>
        }
      />
      <View style={styles.menu}>
        <TouchableOpacity
          style={{ flexDirection: "column" }}
          onPress={() => navigation.navigate("home")}
        >
          <Icon
            type="material-community"
            name="home-circle"
            color="#ffffff"
            size={35}
            underlayColor="transparent"
            containerStyle={{
              width: 50,
              marginTop: 5,
              marginLeft: 5,
              marginRight: 5,
            }}
          />
          <Text style={styles.titleMenu}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flexDirection: "column" }}
          onPress={() => navigation.navigate("search")}
        >
          <Icon
            type="material-community"
            name="magnify"
            color="#ffffff"
            size={35}
            underlayColor="transparent"
            containerStyle={{
              width: 50,
              marginTop: 5,
              marginLeft: 5,
              marginRight: 5,
            }}
          />
          <Text style={styles.titleMenu}>Explorar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flexDirection: "column" }}
          onPress={() => navigation.navigate("library")}
        >
          <Icon
            type="material-community"
            name="playlist-play"
            color="#ffffff"
            size={35}
            underlayColor="transparent"
            containerStyle={{
              width: 50,
              marginTop: 5,
              marginLeft: 5,
              marginRight: 5,
            }}
          />
          <Text style={styles.titleMenu}>Biblioteca</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flexDirection: "column" }}
          onPress={() => navigation.navigate("account")}
        >
          <Icon
            type="material-community"
            name="account-circle"
            color="#ffffff"
            size={35}
            underlayColor="transparent"
            containerStyle={{
              width: 50,
              marginTop: 5,
              marginLeft: 5,
              marginRight: 5,
            }}
          />
          <Text style={styles.titleMenu}>Mi AgriFM</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#422c5e",
  },

  titleIntereses: {
    flex: 1,
    color: "#ffffff",
    textAlign: "center",
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: 18,
    width: 230,
  },

  name: {
    fontWeight: "bold",
    marginTop: 10,
    fontSize: 12,
    color: "#fff",
  },

  follow: {
    fontWeight: "bold",
    marginTop: 10,
    fontSize: 12,
    color: "#fff",
    textAlign: "left",
    paddingLeft: 10,
  },

  followOK: {
    fontWeight: "bold",
    marginTop: 10,
    fontSize: 12,
    color: "#fff",
    textAlign: "center",
    paddingRight: 40,
  },

  info: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 5,
    paddingBottom: 10,
    marginTop: -70,
    marginBottom: 20,
    backgroundColor: "#9a4dff",
    width: 220,
    borderRadius: 100,
    alignSelf: "flex-end",
    marginRight: 20,
  },

  descriptiontext: {
    margin: 10,
    color: "#ffffff",
  },

  favorite: {
    marginTop: -28,
    marginLeft: 115,
  },
  divider: {
    backgroundColor: "#fff",
    margin: 10,
  },
  menu: {
    flexDirection: "row",
    position: "absolute",
    backgroundColor: "#594079",
    width: "100%",
    justifyContent: "space-around",
    bottom: 0,
  },
  titleMenu: {
    textAlign: "center",
    fontSize: 12,
    paddingBottom: 15,
    paddingTop: 5,
    fontWeight: "bold",
    color: "#fff",
  },
  listPodcast: {
    color: "#ffffff",
    marginLeft: 5,
    color: "#94C123",
    fontWeight: "bold",
  },
});
