import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Share,
  DeviceEventEmitter,
  Platform,
} from "react-native";
import {
  Icon,
  SearchBar,
  Image,
  Avatar,
  Divider,
  Button,
} from "react-native-elements";
import Loading from "../../components/Loading";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import initialState from "../../utils/user";
import lang from "../../utils/language";
import playPodcast from "../../utils/playsong";
import axios from "axios";
import RenderHtml from "react-native-render-html";
import Toast from "react-native-root-toast";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default function Search(props) {
  const [search, setSearch] = useState("");
  const navigation = useNavigation();

  ///////////////datos podcast
  const [filteredDataSource, setFilteredDataSource] = useState([]);
  const [masterDataSource, setMasterDataSource] = useState([]);
  const [typeResults, setTypeResults] = useState("1");
  const [language, setLanguage] = useState(lang.idioma);
  const [loading, setLoading] = useState(true);
  const [likeUpdatePodcast, setLikeUpdatePodcast] = useState(
    initialState.likes
  );
  const [selectedPodcast, setSelectedPodcast] = useState(playPodcast.id);
  const [favoritesUpdatePodcast, setFavoritesUpdatePodcast] = useState(
    initialState.favoritosPodcast
  );

  /////////////datos canales

  const [filteredDataCanales, setFilteredDataCanales] = useState([]);
  const [masterDataCanales, setMasterDataCanales] = useState([]);

  ///////////// SHARE // FAVORITES // VIEWS

  const [podcastShare, setPodcastShare] = useState("");
  const [podcastName, setPodcastName] = useState("");

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

  useEffect(() => {
    setLoading(true);
    fetch(
      `https://socialagri.com/agriFM/wp-json/wp/v2/podcast/?lang=${language}&per_page=100`
    )
      .then((response) => response.json())
      .then((responseJson) => {
        setFilteredDataSource(responseJson);
        setMasterDataSource(responseJson);
      })
      .catch((error) => {
        console.error(error);
      });

    fetch(
      `https://socialagri.com/agriFM/wp-json/wp/v2/canales/?lang=${language}&per_page=100`
    )
      .then((response) => response.json())
      .then((responseJson) => {
        setFilteredDataCanales(responseJson);
        setMasterDataCanales(responseJson);
      })
      .catch((error) => {
        console.error(error);
      });

    postCanales();
    nombreCanales();
    mostrarViews();
    mostrarFavoritos();
  }, [language]);

  useFocusEffect(
    useCallback(() => {
      setLanguage(lang.idioma);
    }, [lang])
  );

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
  //var totalviews = [];

  //if (views.length) {
  //  totalviews = views;
  //console.log(totalviews[0]);
  //console.log(totalviews[1]);
  //}

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

        .then(function () { });
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

        .then(function () { });
    }
  };

  function obtenTotalFavoritos(value) {
    for (let i = 0; i < favorites.length; i++) {
      if (value == favorites[i][0]) {
        var favs = favorites[i][1];

        return favs;
      }
    }
  }

  const searchFilterCanales = (text) => {
    // Check if searched text is not blank
    if (text) {
      // Inserted text is not blank
      // Filter the masterDataCanales
      // Update FilteredDataSource
      const newData = masterDataCanales.filter(function (item) {
        const itemData = item.description
          ? item.description
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
          : ""
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        const textData = text
          .toUpperCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        const itemData2 = item.name
          ? item.name
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
          : ""
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        const textData2 = text
          .toUpperCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        //normalize

        if (itemData) {
          return itemData.indexOf(textData) > -1;
        } else if (itemData2) {
          return itemData2.indexOf(textData2) > -1;
        } else {
          return itemData.indexOf(textData) > -1;
        }
      });
      setFilteredDataCanales(newData);
      setSearch(text);
    } else {
      // Inserted text is blank
      // Update FilteredDataSource with masterDataCanales
      setFilteredDataCanales(masterDataCanales);
      setSearch(text);
    }
  };

  const searchFilterFunction = (text) => {
    // Check if searched text is not blank
    if (text) {
      // Inserted text is not blank
      // Filter the masterDataSource
      // Update FilteredDataSource
      const newData = masterDataSource.filter(function (item) {
        const itemData = item.content.rendered
          ? item.content.rendered
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
          : ""
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        const textData = text
          .toUpperCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        if (itemData) {
          return itemData.indexOf(textData) > -1;
        } else {
          return itemData.indexOf(textData) > -1;
        }
      });
      setFilteredDataSource(newData);
      setSearch(text);
    } else {
      // Inserted text is blank
      // Update FilteredDataSource with masterDataSource
      setFilteredDataSource(masterDataSource);
      setSearch(text);
    }
  };

  const [intereses, setIntereses] = useState();
  //URL: la URL de tu endpoint API
  function postCanales() {
    const response = fetch(
      `https://socialagri.com/agriFM/wp-json/wp/v2/intereses/?lang=${language}&per_page=100`,
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
        var nombre = nameCanal[i].name;
        return nombre;
      }
    }
  }

  const ItemView = ({ item }) => {
    return (
      <View style={{ color: "#594079", marginBottom: 20, width: windowWidth }}>
        <View>
          <View style={{ flexDirection: "row" }}>
            <Image
              source={{ uri: item.acf.imagen_podcast1 }}
              style={{ width: 80, height: 80, marginTop: 15, marginLeft: 10 }}
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
                  marginTop: 10,
                  marginLeft: 5,
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

              {/*<Text
                style={{
                  color: "#ffffff",
                  margin: 5,
                  fontWeight: "bold",
                  marginLeft: 10,
                }}
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
                  })
                }
              >
                {item.title.rendered}
              </Text>*/}
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
                        `${obtenTotalFavoritos(item.id) == undefined
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
                          `${obtenTotalFavoritos(item.id) == undefined
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
                description: item.description,
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
              <Image
                source={{ uri: item.acf.imagen_perfil }}
                style={{ width: 130, height: 130, margin: 10 }}
                PlaceholderContent={<ActivityIndicator />}
              />
            </View>
            <Text style={styles.titleChannel}>{item.name}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

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

        .then(function () { });
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

        .then(function () { });
    }
  };

  return (
    <View style={styles.container}>
      <Loading
        isVisible={loading}
        text={
          language === "es" ? "Cargando Podcast..." : "Carregando Podcast..."
        }
      />
      <Image
        source={require("./assets/img/Logo.png")}
        resizeMode="contain"
        style={styles.image}
      />
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
          marginRight: 20,
          marginTop: -60,
          marginBottom: 20,
          alignSelf: "flex-end",
        }}
      />

      <SearchBar
        round
        searchIcon={{ size: 24 }}
        onChangeText={(text) => (
          searchFilterFunction(text), searchFilterCanales(text)
        )}
        onClear={(text) => searchFilterFunction("")}
        placeholder={
          language === "es"
            ? "Buscar por temas, programas"
            : "Pesquisar por tópicos, programas"
        }
        value={search}
        containerStyle={{
          backgroundColor: "#422c5e",
          borderBottomWidth: 0,
          borderTopWidth: 0,
        }}
        inputContainerStyle={{
          backgroundColor: "#594079",
        }}
        inputStyle={{ color: "#fff" }}
        placeholderTextColor="#fff"
        searchIcon={{ color: "#fff", size: 30 }}
      />

      {search ? (
        <Text style={styles.breadcrumb}>
          {language === "es" ? "Todo lo relacionado con:" : "Seus interesses"}{" "}
          {search}
        </Text>
      ) : (
        <Text style={styles.breadcrumb}></Text>
      )}
      {search ? (
        <View style={styles.searchList}>
          <View style={{ flexDirection: "row" }}>
            <Text
              style={
                typeResults === "1"
                  ? styles.titleContentActive
                  : styles.titleContent
              }
              onPress={() => setTypeResults("1")}
            >
              PODCAST
            </Text>
            <Text
              style={
                typeResults === "2"
                  ? styles.titleContentActive
                  : styles.titleContent
              }
              onPress={() => setTypeResults("2")}
            >
              {language === "es" ? "CANALES" : "CANAIS"}
            </Text>
          </View>

          {typeResults === "1" ? (
            search ? (
              filteredDataSource.length ? (
                <FlatList
                  data={filteredDataSource}
                  keyExtractor={({ id }, index) => id}
                  style={{ width: windowWidth }}
                  key={"_"} // evita el error de los cambios de columnas
                  //  ItemSeparatorComponent={ItemSeparatorView}
                  renderItem={ItemView}
                  contentContainerStyle={{ paddingBottom: 250 }}
                />
              ) : (
                <View>
                  <Image
                    source={require("../../../assets/img/icon-alert.png")}
                    resizeMode="contain"
                    style={styles.imageAlert}
                  />
                  {language === "es" ? (
                    <Text style={styles.title}>
                      No hay podcast que{"\n"} coincidan con tu busqueda
                    </Text>
                  ) : (
                    <Text style={styles.title}>
                      Não há podcasts que {"\n"}correspondam à sua pesquisa
                    </Text>
                  )}
                </View>
              )
            ) : (
              <View></View>
            )
          ) : search ? (
            filteredDataCanales.length ? (
              <FlatList
                data={filteredDataCanales}
                contentContainerStyle={styles.list}
                numColumns={2}
                columnWrapperStyle={styles.column}
                keyExtractor={({ id }, index) => id}
                key={"#"}
                style={{ width: windowWidth }}
                //  ItemSeparatorComponent={ItemSeparatorView}
                renderItem={ItemViewCanal}
                contentContainerStyle={{ paddingBottom: 250 }}
              />
            ) : (
              <View>
                <Image
                  source={require("../../../assets/img/icon-alert.png")}
                  resizeMode="contain"
                  style={styles.imageAlert}
                />
                {language === "es" ? (
                  <Text style={styles.title}>
                    No hay canales que {"\n"} coincidan con tu busqueda
                  </Text>
                ) : (
                  <Text style={styles.title}>
                    Não há canais que {"\n"}correspondam à sua pesquisa
                  </Text>
                )}
              </View>
            )
          ) : (
            <View>
              <Text style={styles.title}>Recomendaciones de canales</Text>

              <FlatList //HAY UN ERRROR, el IF anterior lo desactiva
                data={canales}
                renderItem={({ item }) => (
                  <View>
                    <TouchableOpacity
                      onPress={() => {
                        console.log("ok, tematica");
                      }}
                    >
                      <Image
                        source={{ uri: item.acf.imagen_perfil }}
                        style={{ width: 80, height: 80, margin: 10 }}
                        PlaceholderContent={<ActivityIndicator />}
                      />

                      <Text style={styles.titleChannel}>{item.name}</Text>
                    </TouchableOpacity>
                  </View>
                )}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 250 }}
              />
            </View>
          )}
        </View>
      ) : (
        <View>
          <Text style={styles.breadcrumbInteres}>
            {language === "es" ? "Intereses" : "Interesses"}
          </Text>
          <FlatList
            key={"0"}
            data={intereses}
            contentContainerStyle={styles.list}
            numColumns={2}
            columnWrapperStyle={styles.column}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("intereses", {
                    id: item.id,
                    name: language === "es" ? item.name : item.acf.name_pt,
                    color: item.acf.color,
                  })
                }
              >
                <View
                  style={{
                    backgroundColor: item.acf.color,
                    width: 130,
                    height: 130,
                    margin: 5,
                    marginBottom: 10,
                    borderRadius: 15,
                  }}
                >
                  <Text style={styles.titleIntereses}>
                    {language === "es" ? item.name : item.acf.name_pt}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListFooterComponent={<View style={{ paddingBottom: 400 }}></View>}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#422c5e",
  },
  breadcrumb: {
    color: "#fff",
    margin: 15,
    fontSize: 12,
    fontWeight: "bold",
  },
  breadcrumbInteres: {
    textAlign: "center",
    color: "#fff",
    marginBottom: 10,
    fontSize: 21,
    fontWeight: "bold",
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
  searchList: {
    width: windowWidth,
    marginTop: 20,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  list: {
    justifyContent: "space-around",
  },
  column: {
    //flexShrink: 1 //no hace falta
    justifyContent: "space-evenly",
  },
  titleChannel: {
    flex: 1,
    color: "#ffffff",
    marginBottom: 10,
    textAlign: "center",
    alignSelf: "center",
    fontWeight: "bold",
    width: 130,
  },
  titleIntereses: {
    //flex: 1,
    color: "#ffffff",
    textAlign: "center",
    alignSelf: "center",
    fontWeight: "bold",
    width: 100,
    fontSize: windowWidth > 400 ? 14 : 12,
    marginTop: 40,

    //textAlignVertical: "center",
  },
  title: {
    fontWeight: "bold",
    fontSize: 19,
    marginBottom: 20,
    textAlign: "center",
    color: "#ffffff",
  },
  image: {
    height: 50,
    alignSelf: "center",
    margin: 10,
    marginBottom: 20,
    marginTop: Platform.OS === "android" ? 45 : 65,
  },
  imageAlert: {
    height: 150,
    width: "100%",
    marginBottom: 40,
    marginTop: 40,
  },
  divider: {
    backgroundColor: "#fff",
    margin: 10,
  },
  listPodcast: {
    color: "#ffffff",
    marginLeft: 5,
    color: "#94C123",
    fontWeight: "bold",
  },
});
