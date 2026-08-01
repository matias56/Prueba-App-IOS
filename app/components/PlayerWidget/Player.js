import React, { useEffect, useState, useRef, useCallback } from "react";
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
  BackHandler,
  Platform,
} from "react-native";
import { Icon, ScrollView, Button } from "react-native-elements";
import { Audio } from "expo-av";
import { AutoScrollFlatList } from "react-native-autoscroll-flatlist";
import Loading from "../../components/Loading";
import axios from "axios";
import initialState from "../../utils/user";
import playPodcast from "../../utils/playsong";
import NoPlayer from "./NoPlayer";
import { NavigationContainer, useFocusEffect } from "@react-navigation/native";
import lang from "../../utils/language";
import { Home } from "../../screens/Podcast/Home";
import { Slider } from "@miblanchard/react-native-slider";
import { useNavigation } from "@react-navigation/native";
import { useKeepAwake } from "expo-keep-awake";
import RenderHtml from "react-native-render-html";
import Toast from "react-native-root-toast";
import Modal3min from "../Modal3min";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default function PlayerWidget(props) {
  const navigation = useNavigation();
  //const { navigation, route } = props;
  //const { id, name, image, podcast, categories } = route.params;

  //navigation.setOptions({ title: name });

  ///////////// SHARE // FAVORITES // VIEWS

  const [cancion, setCancion] = useState(null);

  /*
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [podcast, setPodcast] = useState("");
  const [categories, setCategories] = useState("");
  */

  //////////// configuración de sonido /////////////////////////////////////////////////

  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(1);
  const [position, setPosition] = useState(0);
  const [storedPosition, setStoredPosition] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [favoritesUpdatePodcast, setFavoritesUpdatePodcast] = useState([]);
  const [language, setLanguage] = useState(lang.idioma);
  const [min3Login, setMin3Login] = useState(false);

  // const [state, setstate] = useState(false);

  const [vistaAmpliada, setVistaAmpliada] = useState(true);

  useEffect(() => {
    DeviceEventEmitter.addListener("reproduccion", (event) => {
      setCancion(event);
      setIsPlaying(true); //lo cambio para editar el widget
      setIsLoaded(true);
      setLoading(true);
    });

    return () => {
      DeviceEventEmitter.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    DeviceEventEmitter.addListener("idioma", (event) => {
      setLanguage(event.idioma);
    });
  }, []);

  useEffect(() => {
    DeviceEventEmitter.addListener("userInvitado", (event) => {
      setCancion(event.cancion);
    });
  }, []);

  useEffect(() => {
    //evita cargar cancion.podcast ya que el si el source es null da error
    playCurrentSong();
  }, [cancion]);

  useEffect(() => {
    if (position >= 200) {
      setLoading(false);
    }
    if (position >= 180000 && initialState.userID === "invitado") {
      setMin3Login(true);
    }
  }, [position]);

  useEffect(() => {
    if (initialState.userID === "invitado") {
      //usuario invitado
    } else {
      if (cancion) {
        axios
          .get(
            `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/stored-time-podcast.php?id_user=${initialState.userID}&id_podcast=${cancion.id}`
          )
          .then(function (response) {
            // handle success
            //if (JSON.stringify(response.data)=="undefined"){
            //  setPosition(0)
            //}else {
            //setPosition(JSON.stringify(response.data));
            if (parseInt(JSON.stringify(response.data)) > 10000) {
              setStoredPosition(
                parseInt(JSON.stringify(response.data)) - 10000
              );
            } else {
              setStoredPosition(parseInt(JSON.stringify(response.data)));
            }

            //console.log(parseInt(JSON.stringify(response.data))); milisegundos

            //}
          })

          .then(function () {});
      }
    }
  }, [cancion]);

  useEffect(async () => {
    if (position >= 180000 && initialState.userID === "invitado") {
      await sound.setStatusAsync({
        positionMillis: 0,
        shouldPlay: false,
      });
      setIsLoaded(false);
    }
  }, [position]);

  useEffect(async () => {
    if (storedPosition) {
      await sound.setStatusAsync({
        positionMillis: storedPosition,
      });
    }
  }, [loading]);

  useEffect(() => {
    if (initialState.userID === "invitado") {
      //usuario invitado
    } else {
      if (cancion) {
        axios
          .get(
            `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/save-time-podcast.php?id_user=${initialState.userID}&id_podcast=${cancion.id}&time_podcast=${position}`
          )
          .then(function (response) {
            // handle success
            //console.log(JSON.stringify(response.data));
          })

          .then(function () {});
      }
      if (position >= duration) {
        axios
          .get(
            `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/save-time-podcast.php?id_user=${
              initialState.userID
            }&id_podcast=${cancion.id}&time_podcast=${0}`
          )
          .then(function (response) {
            // handle success
            //console.log(JSON.stringify(response.data));
          })

          .then(function () {});
      }
    }
  }, [position]);

  const onPlaybackStatusUpdate = (status) => {
    setIsPlaying(status.isPlaying);
    setDuration(status.durationMillis);
    setPosition(status.positionMillis);

    //console.log(status);
  };

  const playCurrentSong = async () => {
    if (sound) {
      await sound.unloadAsync();
    }
    const { sound: newSound } =
      (await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
        playsInSilentModeIOS: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
        shouldDuckAndroid: true,
        staysActiveInBackground: true,
        //playThroughEarpieceAndroid: true,
      }),
      await Audio.Sound.createAsync(
        {
          uri: cancion.podcast,
        },
        { shouldPlay: isPlaying },
        onPlaybackStatusUpdate
      ));
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

  const newPosition = async (value) => {
    await sound.setStatusAsync({
      positionMillis: value,
    });
    console.log(value);
  };

  const addView = () => {
    axios
      .get(
        `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/add-view-app.php?id_user=${initialState.userID}&id_podcast=${cancion.id}`
      )
      .then(function (response) {
        // handle success
        //console.log(JSON.stringify(response));
      })

      .then(function () {});
  };

  //////// funciones de tiempo ////////////////////////////////////////////////
  const getProgress = () => {
    if (sound === null || duration === null || position === null) {
      return 0;
    }
    return (position / duration) * 100;
  };

  const seconds = () => {
    if (sound === null || duration === null || position === null) {
      return 0;
    }
    return Math.floor((position % (1000 * 60)) / 1000);
  };

  const minutes = () => {
    if (sound === null || duration === null || position === null) {
      return 0;
    }
    return Math.floor((position % (1000 * 60 * 60)) / 60000);
  };

  const hours = () => {
    if (sound === null || duration === null || position === null) {
      return 0;
    }
    return Math.floor((position % (1000 * 60 * 60 * 60)) / (60000 * 60));
  };

  const totalseconds = () => {
    if (sound === null || duration === null || position === null) {
      return 0;
    }
    return Math.floor((duration % (1000 * 60)) / 1000);
  };

  const totalminutes = () => {
    if (sound === null || duration === null || position === null) {
      return 0;
    }
    return Math.floor((duration % (1000 * 60 * 60)) / 60000);
  };

  const totalhours = () => {
    if (sound === null || duration === null || position === null) {
      return 0;
    }
    return Math.floor((duration % (1000 * 60 * 60 * 60)) / (60000 * 60));
  };

  //const { sound: playbackObject } =  Audio.Sound.createAsync(
  //  { uri: sound },
  //  { shouldPlay: false }
  //);

  //const [state, setstate] = useState(true);

  //function defaultWidget() {
  //  setstate(!state);
  //}
  useKeepAwake();

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
          var MiLibreria = response.data[0].favoritos_podcast;

          if (MiLibreria === null) {
            // establece un array vació si no hay podcast favoritos
            MiLibreria = [];
          } else if (!MiLibreria) {
            MiLibreria = [];
          }
          //console.log(valueID);
          DeviceEventEmitter.emit("guardarPodcast", {
            favoritosPodcast: MiLibreria,
          });
          setFavoritesUpdatePodcast(MiLibreria);
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
          var MiLibreria = response.data[0].favoritos_podcast;

          if (MiLibreria === null) {
            // establece un array vació si no hay podcast favoritos
            MiLibreria = [];
          } else if (!MiLibreria) {
            MiLibreria = [];
          }
          //console.log(valueID);
          DeviceEventEmitter.emit("guardarPodcast", {
            favoritosPodcast: MiLibreria,
          });
          setFavoritesUpdatePodcast(MiLibreria);
        })

        .then(function () {});
    }
  };

  useEffect(() => {
    DeviceEventEmitter.addListener("library", (event) => {
      setFavoritesUpdatePodcast(event.favoritosPodcast);
    });
  }, []);

  function onShare() {
    //compartir podcast
    try {
      const result = Share.share({
        message:
          language === "es"
            ? `Te recomiendo que escuches este podcast de agriFM "${
                cancion.name
              }"${"\n"}${cancion.linkweb} `
            : `Eu recomendo que você ouça este podcast da agriFM "${
                cancion.name
              }"${"\n"}${cancion.linkweb} `,
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

  return cancion ? (
    <View
      style={{
        backgroundColor: "#E1E1E1",
        //alignItems: "center",
        //justifyContent: "center",
        position: "absolute",
        bottom: vistaAmpliada ? 0 : 75,
        width: "100%",
        borderTopColor: "#fff",
        borderTopWidth: 0.4,
      }}
    >
      <Modal3min isVisible={min3Login} setIsVisible={setMin3Login}>
        <View
          style={{
            justifyContent: "center",
            flex: 1,
            marginTop: -45,
          }}
        >
          <Icon
            type="material-community"
            name="close"
            color="#FFFFFF"
            size={45}
            underlayColor="transparent"
            containerStyle={{ marginBottom: 40 }}
            onPress={() => setMin3Login(false)}
          />
          <Text
            style={{
              color: "#ffffff",
              fontSize: 45,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            {language === "es" ? "Acceso protegido" : "Acesso protegido"}
          </Text>
          <Text
            style={{
              color: "#ffffff",
              fontSize: 18,
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            {language === "es"
              ? "Para seguir escuchando este podcast y tener acceso ilimitado al resto de podcasts, debe registrarse."
              : "Para continuar ouvindo este podcast e ter acesso ilimitado a outros podcasts, você deve se registrar."}
          </Text>
          <Text
            style={{
              color: "#ffffff",
              fontSize: 18,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {language === "es"
              ? "¡Solo es un minuto y gratuito!"
              : "É apenas um minuto e grátis!"}
          </Text>
          <View style={styles.viewBtn}>
            <Button
              title={language === "es" ? "Ir al login" : "Ir ao login"}
              buttonStyle={styles.btnStyle}
              containerStyle={styles.btnContainer}
              onPress={() => {
                setCancion(null);
                DeviceEventEmitter.emit("podcastselect", {
                  id: "invitado",
                });
                setMin3Login(false);
                navigation.navigate("log", { screen: "login" });
              }}
            />
          </View>
        </View>
      </Modal3min>

      <View style={{ flexDirection: vistaAmpliada ? "column" : "row" }}>
        <Loading isVisible={loading} text="Cargando Podcast..." />
        {vistaAmpliada ? (
          <View
            style={{
              height: windowHeight,
              justifyContent: "center",
              alignItems: "center",
              alignContent: "center",
              alignSelf: "center",
              paddingTop: 30,
            }}
            //onPress={() => setVistaAmpliada(false)}
          >
            <View
              style={{
                width: "100%",
                marginTop: 30,
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  onShare();
                }}
                style={{
                  flexDirection: "row",
                  width: "44%",

                  margin: 2,
                  backgroundColor: "#422c5e",
                  borderRadius: 5,
                  alignContent: "space-around",
                  justifyContent: "center",
                }}
              >
                <Icon
                  type="material-community"
                  name="share-variant"
                  color="#FFFFFF"
                  size={25}
                  underlayColor="transparent"
                  containerStyle={{ margin: 5 }}
                  onPress={() => {
                    onShare();
                  }}
                  style={{
                    flexDirection: "row",
                    width: "50%",
                    justifyContent: "center",
                  }}
                />
                <Text
                  style={{
                    color: "#ffffff",
                    fontSize: 14,
                    textAlign: "center",
                    margin: 10,
                  }}
                  onPress={() => {
                    onShare();
                  }}
                >
                  {language === "es" ? "COMPARTIR" : "COMPARTILHAR"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  //setstate(false);
                  setCancion(null);
                  DeviceEventEmitter.emit("podcastselect", {
                    id: "invitado",
                  });
                }}
                style={{
                  flexDirection: "row",
                  width: "44%",
                  justifyContent: "center",
                  margin: 2,
                  backgroundColor: "#422c5e",
                  borderRadius: 5,
                }}
              >
                <Text
                  style={{
                    color: "#ffffff",
                    fontSize: 14,
                    textAlign: "center",
                    marginTop: 10,
                  }}
                  onPress={() => {
                    //setstate(false);
                    setCancion(null);
                    DeviceEventEmitter.emit("podcastselect", {
                      id: "invitado",
                    });
                  }}
                >
                  {language === "es" ? "CERRAR" : "FECHAR"}
                </Text>
                <Icon
                  type="material-community"
                  name="close"
                  color="#FFFFFF"
                  size={28}
                  underlayColor="transparent"
                  containerStyle={{ margin: 5 }}
                  onPress={() => {
                    //setstate(false);
                    setCancion(null);
                    DeviceEventEmitter.emit("podcastselect", {
                      id: "invitado",
                    });
                  }}
                  style={{
                    flexDirection: "row",
                    width: "50%",
                    justifyContent: "center",
                  }}
                />
              </TouchableOpacity>
            </View>
            {/*<View
              style={{
                alignSelf: "flex-end",
              }}
            >
              <Icon
                type="material-community"
                name="close"
                onPress={() => {
                  //setstate(false);
                  setCancion(null);
                  DeviceEventEmitter.emit("podcastselect", {
                    id: "",
                  });
                }}
                color="#868A7E"
                size={40}
                underlayColor="transparent"
                containerStyle={{ marginTop: 10, marginRight: -80 }}
              />
              </View>*/}
            {favoritesUpdatePodcast ? (
              <View style={{ margin: 10 }}>
                {cancion.id == favoritesUpdatePodcast[0] ||
                cancion.id == favoritesUpdatePodcast[1] ||
                cancion.id == favoritesUpdatePodcast[2] ||
                cancion.id == favoritesUpdatePodcast[3] ||
                cancion.id == favoritesUpdatePodcast[4] ||
                cancion.id == favoritesUpdatePodcast[5] ||
                cancion.id == favoritesUpdatePodcast[6] ||
                cancion.id == favoritesUpdatePodcast[7] ||
                cancion.id == favoritesUpdatePodcast[8] ||
                cancion.id == favoritesUpdatePodcast[9] ||
                cancion.id == favoritesUpdatePodcast[10] ||
                cancion.id == favoritesUpdatePodcast[11] ||
                cancion.id == favoritesUpdatePodcast[12] ||
                cancion.id == favoritesUpdatePodcast[13] ||
                cancion.id == favoritesUpdatePodcast[14] ||
                cancion.id == favoritesUpdatePodcast[15] ||
                cancion.id == favoritesUpdatePodcast[16] ||
                cancion.id == favoritesUpdatePodcast[17] ||
                cancion.id == favoritesUpdatePodcast[18] ||
                cancion.id == favoritesUpdatePodcast[19] ||
                cancion.id == favoritesUpdatePodcast[20] ||
                cancion.id == favoritesUpdatePodcast[21] ||
                cancion.id == favoritesUpdatePodcast[22] ||
                cancion.id == favoritesUpdatePodcast[23] ||
                cancion.id == favoritesUpdatePodcast[24] ||
                cancion.id == favoritesUpdatePodcast[25] ||
                cancion.id == favoritesUpdatePodcast[26] ? (
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
                      marginTop: 40,
                    }}
                    onPress={() => {
                      removePodcast(cancion.id);
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
                      marginTop: 40,
                    }}
                    onPress={() => {
                      addPodcast(cancion.id);
                    }}
                  />
                )}
              </View>
            ) : (
              <View></View>
            )}
            <TouchableOpacity
              onPress={() => {
                setVistaAmpliada(false);
                navigation.navigate("podcast", {
                  id: cancion.id,
                  name: cancion.name,
                  image: cancion.image,
                  categories: cancion.categories,
                  categoriesid: cancion.categoriesid,
                  podcast: cancion.podcast,
                  //interes: item.intereses[0],
                  description: cancion.description,
                  linkweb: cancion.linkweb,
                });
              }}
            >
              <Image
                source={{ uri: cancion.image }}
                style={{
                  width: windowWidth / 2,
                  height: windowWidth / 2,
                  margin: 10,
                  //marginTop: 40,
                  marginBottom: 0,
                  alignSelf: "center",
                  borderRadius: 5,
                }}
              />
            </TouchableOpacity>
            <View
              style={{
                flexDirection: "column",
                marginTop: 10,
                width: (windowWidth / 3) * 2,
                justifyContent: "center",
                alignItems: "center",
                alignContent: "center",
                alignSelf: "center",
              }}
            >
              <Text style={styles.titleSound}>
                {cancion.categories.slice(0, 20)}
                {cancion.categories.length > 20 ? "..." : ""}
              </Text>
              {/*<Text style={styles.titleCategories}>
                {cancion ? cancion.name.slice(0, 40) : ""}
                {cancion ? (cancion.name.length > 40 ? "..." : "") : ""}
              </Text>*/}
              <RenderHtml
                contentWidth={windowWidth}
                source={{
                  html: `
      <p style='text-align:left; color:#484848; font-size:12px'>
        ${cancion ? cancion.name.slice(0, 44) : ""}
        ${cancion ? (cancion.name.length > 44 ? "..." : "") : ""}
      </p>`,
                }}
              />
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={{ flexDirection: "row" }}
            onPress={() => setVistaAmpliada(true)}
          >
            <Icon
              type="material-community"
              name="close"
              onPress={() => {
                setVistaAmpliada(true);
                //setstate(false);
                setCancion(null);

                DeviceEventEmitter.emit("podcastselect", {
                  id: "invitado",
                });
              }}
              color="#868A7E"
              size={30}
              underlayColor="transparent"
              containerStyle={{ marginTop: 20, marginLeft: 10 }}
            />
            <Image
              source={{ uri: cancion.image }}
              style={{
                width: 40,
                height: 40,
                margin: 10,
                marginBottom: 0,
                alignSelf: "center",
                borderRadius: 5,
              }}
            />
            <View
              style={{
                flexDirection: "column",
                marginTop: 10,
              }}
            >
              <Text style={styles.titleSound}>
                {cancion.categories.slice(0, 16)}
                {cancion.categories.length > 16 ? "..." : ""}
              </Text>

              {/*
                <Text style={styles.titleCategories}>
                  {cancion ? cancion.name.slice(0, 30) : ""}
                  {cancion ? (cancion.name.length > 30 ? "..." : "") : ""}
                </Text>
              */}
              <RenderHtml
                contentWidth={windowWidth}
                source={{
                  html: `
      <p style='text-align:left; color:#484848; font-size:12px'>
        ${cancion ? cancion.name.slice(0, 30) : ""}
        ${cancion ? (cancion.name.length > 30 ? "..." : "") : ""}
      </p>`,
                }}
              />
            </View>
          </TouchableOpacity>
        )}
        {/*!isLoaded ? (
          <View>
            <Icon
              type="material-community"
              name="close"
              onPress={() => {
                setstate(false);
              }}
              color="#94C123"
              size={30}
              underlayColor="transparent"
              containerStyle={{ flex: 1 }}
            />
          </View>
        ) : (
          <View></View>
        )*/}
        {!vistaAmpliada ? (
          <View
            style={{
              flex: 1,
              alignContent: "flex-end",
              justifyContent: "flex-end",
              alignItems: "flex-end",
              margin: 5,
              flexDirection: "row",
            }}
          >
            <View style={{ flexDirection: "column" }}>
              {position >= duration ? (
                <Icon
                  type="material-community"
                  name={"replay"}
                  onPress={() => {
                    reload();
                  }}
                  color="#94C123"
                  size={36}
                  underlayColor="transparent"
                  containerStyle={{
                    borderColor: "#94C123",
                    borderRadius: 50,
                    borderWidth: 3,
                  }}
                />
              ) : (
                <Icon
                  type="material-community"
                  name={isLoaded ? "pause-circle-outline" : "play-circle"}
                  onPress={() => {
                    onPlayPausePress();
                    setIsLoaded(!isLoaded);
                    addView();
                  }}
                  color="#94C123"
                  size={42}
                  underlayColor="transparent"
                />
              )}
              <Text
                style={{
                  color: "#292A27",
                  marginTop: -3,
                  marginBottom: -10,
                  fontSize: 11,
                  textAlign: "center",

                  fontWeight: "normal",
                }}
              >
                {hours() > 9 ? "" : "0"}
                {!hours() ? "0" : `${hours()}`}
                {":"}
                {minutes() > 9 ? "" : "0"}
                {!minutes() ? "0" : `${minutes()}`}
                {":"}
                {seconds() > 9 ? "" : "0"}
                {!seconds() ? "0" : `${seconds()}`}
              </Text>
            </View>
          </View>
        ) : (
          <View></View>
        )}
      </View>
      {/*<View style={styles.totalDuration} />
      <View style={[styles.progress, { width: `${getProgress()}%` }]} />*/}

      {vistaAmpliada ? (
        <View style={styles.containerSlider}>
          <Slider
            value={position}
            onValueChange={(value) => newPosition(parseInt(value))}
            maximumValue={duration}
            thumbTintColor={"#8BBC12"}
            minimumTrackTintColor={"#8BBC12"}
            maximumTrackTintColor={"#BFBFBF"}
            thumbStyle={{ borderWidth: 0.5, borderColor: "#308446" }}
          />
        </View>
      ) : (
        <View></View>
      )}
      {/*<Text>Value: {position}</Text>*/}
      {vistaAmpliada ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              textAlign: "left",
              color: "#292A27",
              marginTop: -7,

              marginLeft: 15,
              fontWeight: "normal",
            }}
          >
            {hours() > 9 ? "" : "0"}
            {!hours() ? "0" : `${hours()}`}
            {":"}
            {minutes() > 9 ? "" : "0"}
            {!minutes() ? "0" : `${minutes()}`}
            {":"}
            {seconds() > 9 ? "" : "0"}
            {!seconds() ? "0" : `${seconds()}`}
          </Text>
          <Text
            style={{
              textAlign: "right",
              color: "#292A27",
              marginTop: -7,

              marginRight: 15,
              fontWeight: "normal",
            }}
          >
            {totalhours() > 9 ? "" : "0"}
            {!totalhours() ? "0" : `${totalhours()}`}
            {":"}
            {totalminutes() > 9 ? "" : "0"}
            {!totalminutes() ? "0" : `${totalminutes()}`}
            {":"}
            {totalseconds() > 9 ? "" : "0"}
            {!totalseconds() ? "0" : `${totalseconds()}`}
          </Text>
        </View>
      ) : (
        <View></View>
      )}
      {vistaAmpliada ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={styles.ten}>10s</Text>
          <Icon
            type="material-community"
            name="restore"
            onPress={statusMoveDown}
            color="#94C123"
            size={40}
            underlayColor="transparent"
          />
          {position >= duration ? (
            <Icon
              type="material-community"
              name={"replay"}
              onPress={() => {
                reload();
              }}
              color="#ffffff"
              size={54}
              underlayColor="transparent"
              containerStyle={{
                borderColor: "#94C123",
                borderRadius: 50,
                borderWidth: 3,
                backgroundColor: "#94C123",
                margin: 5,
              }}
            />
          ) : (
            <Icon
              type="material-community"
              name={isLoaded ? "pause-circle-outline" : "play-circle"}
              onPress={() => {
                onPlayPausePress();
                setIsLoaded(!isLoaded);
                addView();
              }}
              color="#94C123"
              size={70}
              underlayColor="transparent"
            />
          )}
          <Icon
            type="material-community"
            name="reload"
            onPress={statusMoveOn}
            color="#94C123"
            size={40}
            underlayColor="transparent"
          />
          <Text style={styles.ten}>10s</Text>
        </View>
      ) : (
        <View style={{ paddingBottom: 10 }}></View>
      )}
      {vistaAmpliada ? (
        <TouchableOpacity
          style={{
            backgroundColor: "#422c5e",
            height: 60,
            flexDirection: "row",
            justifyContent: "center",
          }}
          onPress={() => setVistaAmpliada(false)}
        >
          <Icon
            type="material-community"
            name="chevron-down"
            color="#fff"
            size={40}
            underlayColor="transparent"
            containerStyle={{ justifyContent: "center" }}
            onPress={() => setVistaAmpliada(false)}
          />
          <Text
            style={{
              color: "#ffffff",
              fontSize: 14,

              marginTop: 20,
            }}
          >
            OCULTAR
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={{ height: 0 }}></View>
      )}
    </View>
  ) : (
    <TouchableOpacity style={{ backgroundColor: "#422c5e", height: 0 }}>
      <Text
        style={{
          textAlign: "center",
          color: "#ffffff",
          marginTop: 15,
          marginBottom: 15,
        }}
      >
        Escuchar el podcast seleccionado
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    //backgroundColor: "#E1E1E1",
    //alignItems: "center",
    //justifyContent: "center",
    //position: "absolute",
    //bottom: 60,
    //width: "100%",
    //borderTopColor: "#fff",
    //borderTopWidth: 0.4,
  },
  titleSound: {
    color: "#422c5e",
    fontSize: 15,
    textAlign: "left",
    //marginHorizontal: 10,
    marginBottom: -10,
    fontWeight: "bold",
  },
  titleSound2: {
    color: "#422c5e",
    fontSize: 15,
    textAlign: "left",
    marginHorizontal: 10,

    fontWeight: "bold",
  },
  title2: {
    color: "#484848",
    fontSize: 19,
    textAlign: "center",
    marginTop: 15,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  titleCategories: {
    color: "#484848",
    fontSize: 12,
    textAlign: "left",
    marginHorizontal: 10,
  },
  ten: {
    color: "#94C123",
    fontWeight: "bold",
  },
  progress: {
    height: 5,
    backgroundColor: "#94C123",
    marginLeft: 0,
    marginRight: 0,
  },
  totalDuration: {
    height: 5,
    backgroundColor: "#9a4dff",
    marginLeft: 0,
    marginRight: 0,
    marginBottom: -5,
  },
  /////////v2

  container2: {
    position: "absolute",
    bottom: 79,
    backgroundColor: "#131313",
    width: "100%",
    borderWidth: 2,
    borderColor: "black",
  },

  containerSlider: {
    marginLeft: 15,
    marginRight: 15,

    marginTop: -75,
  },
  viewBtn: {
    alignItems: "center",
    marginTop: 20,
  },
  btnStyle: {
    backgroundColor: "#93bf22",
  },
  btnContainer: {
    width: 200,
  },
});
