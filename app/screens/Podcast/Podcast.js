import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  DeviceEventEmitter,
} from "react-native";
import { Icon, ScrollView, Button } from "react-native-elements";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Audio } from "expo-av";
import { AutoScrollFlatList } from "react-native-autoscroll-flatlist";
import Loading from "../../components/Loading";
import axios from "axios";
import initialState from "../../utils/user";
import playPodcast from "../../utils/playsong";
import lang from "../../utils/language";
import Toast from "react-native-root-toast";
import RenderHtml from "react-native-render-html";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default function Podcast(props) {
  const { navigation, route } = props;
  const {
    id,
    name,
    image,
    podcast,
    categories,
    categoriesid,
    interes,
    description,
    linkweb,
  } = route.params;
  const [language, setLanguage] = useState(lang.idioma);
  console.log(route.params);

  navigation.setOptions({ title: name });

  ///////////// SHARE // FAVORITES // VIEWS

  const [podcastShare, setPodcastShare] = useState("");
  const [podcastName, setPodcastName] = useState("");

  //////////// configuración de sonido /////////////////////////////////////////////////

  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(1);
  const [position, setPosition] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [favoritesUpdatePodcast, setFavoritesUpdatePodcast] = useState(
    initialState.favoritosPodcast
  );

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

  const [likeUpdatePodcast, setLikeUpdatePodcast] = useState(
    initialState.likes
  );

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

  const onPlaybackStatusUpdate = (status) => {
    setIsPlaying(status.isPlaying);
    setDuration(status.durationMillis);
    setPosition(status.positionMillis);
    //console.log(status);
  };

  useEffect(() => {
    setLoading(true);
    playCurrentSong();
    nombreCanales();
    mostrarViews();
    mostrarFavoritos();
  }, []);

  useEffect(() => {
    if (podcastShare) {
      onShare();
    }
  }, [podcastShare]);

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: `Te recomiendo que escuches este podcast de agriFM "${podcastName}"${"\n"}${podcastShare} `,
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
      }
    } catch (error) {
      alert(
        language === "es"
          ? "No se ha podido compartir"
          : "Não foi possível compartilhar"
      );
    }
  };

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
        setLoading(false);
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

  const playCurrentSong = async () => {
    if (sound) {
      await sound.unloadAsync();
    }
    const { sound: newSound } = await Audio.Sound.createAsync(
      {
        uri: podcast,
      },
      { shouldPlay: isPlaying },
      onPlaybackStatusUpdate
    );
    setSound(newSound);
  };

  const onPlayPausePress = async () => {
    if (!sound) {
      return;
    }
    if (isPlaying) {
      await sound.setStatusAsync({
        shouldPlay: false,
      });
    } else {
      await sound.playAsync();
    }
  };

  const statusMoveOn = async () => {
    if (!sound) {
      return;
    }
    if (isPlaying) {
      await sound.setStatusAsync({
        positionMillis: position + 10000,
      });
    }
  };

  const statusMoveDown = async () => {
    if (!sound) {
      return;
    }
    if (isPlaying) {
      await sound.setStatusAsync({
        positionMillis: position - 10000,
      });
    }
  };

  const reload = async () => {
    await sound.setStatusAsync({
      positionMillis: 0,
      shouldPlay: true,
    });
  };

  const addView = () => {
    axios
      .get(
        `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/add-view-app.php?id_user=${initialState.userID}&id_podcast=${id}`
      )
      .then(function (response) {
        // handle success
        console.log(JSON.stringify(response.data[0]));
      })

      .then(function () {});
  };

  const getProgress = () => {
    if (sound === null || duration === null || position === null) {
      return 0;
    }
    return (position / duration) * 100;
  };

  //const { sound: playbackObject } =  Audio.Sound.createAsync(
  //  { uri: sound },
  //  { shouldPlay: false }
  //);

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
        var nombre = nameCanal[i].name;
        setLoading(false);
        return nombre;
      }
    }
  }

  function obtenImagenCanal(value) {
    for (let i = 0; i < nameCanal.length; i++) {
      if (value == nameCanal[i].id) {
        var nombre = nameCanal[i].acf.imagen_perfil;
        setLoading(false);
        return nombre;
      }
    }
  }

  function obtenDescriptionCanal(value) {
    for (let i = 0; i < nameCanal.length; i++) {
      if (value == nameCanal[i].id) {
        var nombre = nameCanal[i].description;
        setLoading(false);
        return nombre;
      }
    }
  }

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

  return (
    <View style={styles.container}>
      <Loading isVisible={loading} text="Cargando Podcast..." />
      <View style={styles.single}>
        <View>
          <Image
            source={{ uri: image }}
            style={{
              width: 120,
              height: 120,
              margin: 20,
              alignSelf: "flex-start",
            }}
          />
          <View
            style={{
              flexDirection: "row",
              marginLeft: -18,
              alignContent: "center",
              justifyContent: "center",
              marginTop: -13,
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
                obtenTotalViews(id)
              }
            </Text>
            {!obtenTotalViews(id) ? (
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
        <View>
          <Text
            style={styles.titleCategories}
            onPress={() => {
              navigation.navigate("canales", {
                id: categoriesid,
                name: obtenNombreCanal(categoriesid),
                image: obtenImagenCanal(categoriesid),
                description: obtenDescriptionCanal(categoriesid),
                idUser: initialState.userID,
              });
            }}
          >
            {categories}
          </Text>
          {/*<Text style={styles.titleSound}>{name}</Text>*/}
          <View style={{ width: Dimensions.get("window").width / 2 }}>
            <RenderHtml
              contentWidth={Dimensions.get("window").width / 2}
              source={{
                html: `
      <p style='text-align:left; color:#ffffff; font-size:16px'>
        ${name}
      </p>`,
              }}
            />
          </View>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#594079",
          marginTop: 10,
          marginBottom: 10,
        }}
      >
        {selectedPodcast != id ? (
          <Icon
            type="material-community"
            name={"play-circle"}
            onPress={() => {
              actualizarPodcast(id, name, image, categories, podcast, linkweb);
            }}
            color="#94C123"
            size={70}
            underlayColor="transparent"
            containerStyle={{
              width: windowWidth / 2,
              paddingLeft: 30,
              paddingTop: 5,
              paddingBottom: 5,
            }}
          />
        ) : (
          <View
            style={{
              height: 81,
              width: 131,
              paddingLeft: 30,
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: "#94C123",
                textAlign: "center",
                marginRight: 10,
                fontWeight: "bold",
              }}
            >
              {language === "es" ? "Escuchando" : "Escutando"}
            </Text>
            <Text
              style={{
                color: "#94C123",
                textAlign: "center",
                fontWeight: "bold",
                marginRight: 2,
              }}
            >
              {language === "es" ? "Ahora..." : "Agora..."}
            </Text>
          </View>
        )}
        <View
          style={{
            flexDirection: "row",
            paddingLeft: 30,
          }}
        >
          <Icon
            type="material-community"
            name="share-variant"
            onPress={() => {
              setPodcastName(name);
              setPodcastShare(linkweb);
            }}
            color="#ffffff"
            size={37}
            underlayColor="transparent"
            containerStyle={{ width: 37, margin: 5 }}
          />

          {id == likeUpdatePodcast[0] ||
          id == likeUpdatePodcast[1] ||
          id == likeUpdatePodcast[2] ||
          id == likeUpdatePodcast[3] ||
          id == likeUpdatePodcast[4] ||
          id == likeUpdatePodcast[5] ||
          id == likeUpdatePodcast[6] ||
          id == likeUpdatePodcast[7] ||
          id == likeUpdatePodcast[8] ||
          id == likeUpdatePodcast[9] ||
          id == likeUpdatePodcast[10] ||
          id == likeUpdatePodcast[11] ||
          id == likeUpdatePodcast[12] ||
          id == likeUpdatePodcast[13] ||
          id == likeUpdatePodcast[14] ||
          id == likeUpdatePodcast[15] ||
          id == likeUpdatePodcast[16] ||
          id == likeUpdatePodcast[17] ||
          id == likeUpdatePodcast[18] ||
          id == likeUpdatePodcast[19] ||
          id == likeUpdatePodcast[20] ||
          id == likeUpdatePodcast[21] ||
          id == likeUpdatePodcast[22] ||
          id == likeUpdatePodcast[23] ||
          id == likeUpdatePodcast[24] ||
          id == likeUpdatePodcast[25] ||
          id == likeUpdatePodcast[26] ||
          id == likeUpdatePodcast[27] ||
          id == likeUpdatePodcast[28] ||
          id == likeUpdatePodcast[29] ||
          id == likeUpdatePodcast[30] ||
          id == likeUpdatePodcast[31] ||
          id == likeUpdatePodcast[32] ||
          id == likeUpdatePodcast[33] ||
          id == likeUpdatePodcast[34] ||
          id == likeUpdatePodcast[35] ||
          id == likeUpdatePodcast[36] ||
          id == likeUpdatePodcast[37] ||
          id == likeUpdatePodcast[38] ||
          id == likeUpdatePodcast[39] ||
          id == likeUpdatePodcast[40] ||
          id == likeUpdatePodcast[41] ||
          id == likeUpdatePodcast[42] ||
          id == likeUpdatePodcast[43] ||
          id == likeUpdatePodcast[44] ||
          id == likeUpdatePodcast[45] ||
          id == likeUpdatePodcast[46] ||
          id == likeUpdatePodcast[47] ||
          id == likeUpdatePodcast[48] ||
          id == likeUpdatePodcast[49] ||
          id == likeUpdatePodcast[50] ||
          id == likeUpdatePodcast[51] ||
          id == likeUpdatePodcast[52] ||
          id == likeUpdatePodcast[53] ||
          id == likeUpdatePodcast[54] ||
          id == likeUpdatePodcast[55] ||
          id == likeUpdatePodcast[56] ||
          id == likeUpdatePodcast[57] ||
          id == likeUpdatePodcast[58] ||
          id == likeUpdatePodcast[59] ||
          id == likeUpdatePodcast[60] ||
          id == likeUpdatePodcast[61] ||
          id == likeUpdatePodcast[62] ||
          id == likeUpdatePodcast[63] ||
          id == likeUpdatePodcast[64] ||
          id == likeUpdatePodcast[65] ||
          id == likeUpdatePodcast[66] ||
          id == likeUpdatePodcast[67] ||
          id == likeUpdatePodcast[68] ||
          id == likeUpdatePodcast[69] ||
          id == likeUpdatePodcast[70] ||
          id == likeUpdatePodcast[71] ||
          id == likeUpdatePodcast[72] ||
          id == likeUpdatePodcast[73] ||
          id == likeUpdatePodcast[74] ||
          id == likeUpdatePodcast[75] ||
          id == likeUpdatePodcast[76] ||
          id == likeUpdatePodcast[77] ||
          id == likeUpdatePodcast[78] ||
          id == likeUpdatePodcast[79] ||
          id == likeUpdatePodcast[80] ||
          id == likeUpdatePodcast[81] ||
          id == likeUpdatePodcast[82] ||
          id == likeUpdatePodcast[83] ||
          id == likeUpdatePodcast[84] ||
          id == likeUpdatePodcast[85] ||
          id == likeUpdatePodcast[86] ||
          id == likeUpdatePodcast[87] ||
          id == likeUpdatePodcast[88] ||
          id == likeUpdatePodcast[89] ||
          id == likeUpdatePodcast[90] ||
          id == likeUpdatePodcast[91] ||
          id == likeUpdatePodcast[92] ||
          id == likeUpdatePodcast[93] ||
          id == likeUpdatePodcast[94] ||
          id == likeUpdatePodcast[95] ||
          id == likeUpdatePodcast[96] ||
          id == likeUpdatePodcast[97] ||
          id == likeUpdatePodcast[98] ||
          id == likeUpdatePodcast[99] ||
          id == likeUpdatePodcast[100] ? (
            <Icon
              type="fontisto"
              name="like"
              color="#9a4dff"
              size={30}
              underlayColor="transparent"
              containerStyle={{
                width: 36,
                margin: 5,
                marginTop: 9,
              }}
              onPress={() => removePodcastLike(id)}
            />
          ) : (
            <Icon
              type="fontisto"
              name="like"
              color="#ffffff"
              size={30}
              underlayColor="transparent"
              containerStyle={{
                width: 36,
                margin: 5,
                marginTop: 9,
              }}
              onPress={() => addPodcastLike(id)}
            />
          )}
          <Text
            style={{
              color: "#ffffff",
              marginLeft: -2,
              fontSize: 15,
            }}
          >
            {
              //mostrarViews(id)
              obtenTotalFavoritos(id)
            }
          </Text>
          {!obtenTotalFavoritos(id) ? (
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
      </View>

      {
        //aqui empieza el play
      }

      {
        //aqui termina el play
      }
      <View style={{ margin: 10 }}>
        {id == favoritesUpdatePodcast[0] ||
        id == favoritesUpdatePodcast[1] ||
        id == favoritesUpdatePodcast[2] ||
        id == favoritesUpdatePodcast[3] ||
        id == favoritesUpdatePodcast[4] ||
        id == favoritesUpdatePodcast[5] ||
        id == favoritesUpdatePodcast[6] ||
        id == favoritesUpdatePodcast[7] ||
        id == favoritesUpdatePodcast[8] ||
        id == favoritesUpdatePodcast[9] ||
        id == favoritesUpdatePodcast[10] ||
        id == favoritesUpdatePodcast[11] ||
        id == favoritesUpdatePodcast[12] ||
        id == favoritesUpdatePodcast[13] ||
        id == favoritesUpdatePodcast[14] ||
        id == favoritesUpdatePodcast[15] ||
        id == favoritesUpdatePodcast[16] ||
        id == favoritesUpdatePodcast[17] ||
        id == favoritesUpdatePodcast[18] ||
        id == favoritesUpdatePodcast[19] ||
        id == favoritesUpdatePodcast[20] ||
        id == favoritesUpdatePodcast[21] ||
        id == favoritesUpdatePodcast[22] ||
        id == favoritesUpdatePodcast[23] ||
        id == favoritesUpdatePodcast[24] ||
        id == favoritesUpdatePodcast[25] ||
        id == favoritesUpdatePodcast[26] ? (
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
              //justifyContent:"center",
              alignSelf: "center",
              height: 40,
              width: 250,
            }}
            onPress={() => {
              removePodcast(id);
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
              //justifyContent:"center",
              alignSelf: "center",
              height: 40,
              width: 250,
            }}
            onPress={() => {
              addPodcast(id);
            }}
          />
        )}
      </View>
      <Text style={styles.title2}>{description}</Text>
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
    //alignItems: "center",
    //justifyContent: "center",
  },
  single: {
    flexDirection: "row",
  },
  titleSound: {
    color: "#fff",
    fontSize: 16,
    textAlign: "left",
    marginRight: 10,
    width: Dimensions.get("window").width / 2,
    marginTop: 10,
  },
  title2: {
    color: "#fff",
    fontSize: 14,
    textAlign: "left",
    marginTop: 15,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  titleCategories: {
    color: "#fff",
    fontSize: 17,
    textAlign: "center",
    marginTop: 15,
    fontWeight: "bold",
    borderRadius: 10,
    borderColor: "#fff",
    borderWidth: 2,
    padding: 5,
    paddingTop: 10,
    paddingBottom: 10,
    width: Dimensions.get("window").width / 2,
    backgroundColor: "#594079",
  },
  ten: {
    color: "#94C123",
  },
  progress: {
    height: 4,
    backgroundColor: "#94C123",
    marginLeft: 0,
    marginRight: 0,
    margin: 30,
  },
  totalDuration: {
    height: 4,
    backgroundColor: "#F9F9F9",
    marginLeft: 0,
    marginRight: 0,
    margin: 30,
    marginBottom: -34,
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
});
