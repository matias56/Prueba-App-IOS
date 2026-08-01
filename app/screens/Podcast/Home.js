import { assign } from "lodash";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import {
  SafeAreaView,
  View,
  FlatList,
  StatusBar,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Share,
  InteractionManager,
  DeviceEventEmitter,
  Platform,
} from "react-native";
import {
  Icon,
  Avatar,
  Image,
  Input,
  ListItem,
  Divider,
  Button,
} from "react-native-elements";
import { SvgCssUri } from "react-native-svg";
import Loading from "../../components/Loading";
import Modal from "../../components/Modal";
import initialState from "../../utils/user";
import lang from "../../utils/language";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import playPodcast from "../../utils/playsong";
import RenderHtml from "react-native-render-html";
import Toast from "react-native-root-toast";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default function Home(props) {
  //const referenciaCanal = useRef(0);
  const { nuevoPodcast, cerrarPodcast } = props;

  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [language, setLanguage] = useState(lang.idioma);
  const [isVisibleShare, setIsVisibleShare] = useState(false);
  const [podcastShare, setPodcastShare] = useState("");
  const [podcastName, setPodcastName] = useState("");
  const [podcastID, setpodcastID] = useState("");
  const [isFollow, setIsFollow] = useState(false);

  const [favoritesUpdatePodcast, setFavoritesUpdatePodcast] = useState(
    initialState.favoritosPodcast
  );

  const [likeUpdatePodcast, setLikeUpdatePodcast] = useState(
    initialState.likes
  );

  const [selectedPodcast, setSelectedPodcast] = useState(playPodcast.id);

  const actualizarPodcast = (
    id,
    name,
    image,
    categories,
    podcast,
    linkweb,
    categoriesid,
    description
  ) => {
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
      categoriesid,
      description,
    });
    //console.log(playPodcast);
    //props.nuevoPodcast = "hola";
  };

  useEffect(() => {
    DeviceEventEmitter.addListener("guardarPodcast", (event) => {
      setFavoritesUpdatePodcast(event.favoritosPodcast);
      initialState.favoritosPodcast = event.favoritosPodcast;
    });
  }, []);

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
    }, [initialState.favoritosPodcast]) //sino funciona cambiar a solo initialState
  );

  useFocusEffect(
    useCallback(() => {
      //console.log("CARGANDO");
      setLikeUpdatePodcast(initialState.likes);
    }, [initialState.likes])
  );

  useEffect(() => {
    postData();
  }, [initialState.likes, selectedPodcast]);

  //referenciaCanal.current = referenciaCanal.current + 1;

  useEffect(() => {
    setLoading(true);
    postData();
    postCanales();
    nombreCanales();
    mostrarViews();
    mostrarFavoritos();
    postIntereses1();
    postIntereses2();
    postIntereses3();
  }, [language]);

  useFocusEffect(
    useCallback(() => {
      //console.log("CARGANDO");
      postIntereses1();
      postIntereses2();
      postIntereses3();
    }, [initialState])
  );

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
          //console.log(JSON.stringify(response.data[0]));
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

  const isFavorite = (value) => {
    for (let index = 0; index < initialState.favoritosPodcast.length; index++) {
      if (value === initialState.favoritosPodcast[index]) {
        return false;
      } else {
        return true;
      }
    }
  };

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

  const [intereses1, setIntereses1] = useState();
  //URL: la URL de tu endpoint API
  function postIntereses1() {
    if (initialState.userID === "invitado") {
      //usuario invitado
    } else {
      const response = fetch(
        `https://socialagri.com/agriFM/wp-json/wp/v2/podcast/?lang=${language}&intereses=${initialState.misIntereses[0]}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      )
        .then((response) => response.json())
        .then((responseJson) => {
          //alert(JSON.stringify(responseJson));
          //console.log(typeof responseJson);
          setIntereses1(responseJson); //sale undefined quitar .results

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
  }

  const [intereses2, setIntereses2] = useState();
  //URL: la URL de tu endpoint API
  function postIntereses2() {
    if (initialState.userID === "invitado") {
      //usuario invitado
    } else {
      const response = fetch(
        `https://socialagri.com/agriFM/wp-json/wp/v2/podcast/?lang=${language}&intereses=${initialState.misIntereses[1]}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      )
        .then((response) => response.json())
        .then((responseJson) => {
          //alert(JSON.stringify(responseJson));
          //console.log(typeof responseJson);
          setIntereses2(responseJson); //sale undefined quitar .results

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
  }

  const [intereses3, setIntereses3] = useState();
  //URL: la URL de tu endpoint API
  function postIntereses3() {
    if (initialState.userID === "invitado") {
      //usuario invitado
    } else {
      const response = fetch(
        `https://socialagri.com/agriFM/wp-json/wp/v2/podcast/?lang=${language}&intereses=${initialState.misIntereses[2]}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      )
        .then((response) => response.json())
        .then((responseJson) => {
          //alert(JSON.stringify(responseJson));
          //console.log(typeof responseJson);
          setIntereses3(responseJson); //sale undefined quitar .results

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
  }

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
        //console.log(favorites);
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

  const [data, setData] = useState([]);
  //URL: la URL de tu endpoint API
  function postData() {
    const response = fetch(
      `https://socialagri.com/agriFM/wp-json/wp/v2/podcast/?lang=${language}&per_page=5`,
      {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json; charset=utf-8" },
      }
    )
      .then((response) => response.json())
      .then((responseJson) => {
        //alert(JSON.stringify(responseJson));
        //console.log(typeof responseJson);
        setData(responseJson);
        //console.log(responseJson);
        // Cadena inicial

        // U+1E9B: LETRA S LATINA MINÚSCULA CON PUNTO ARRIBA
        // U+0323: COMBINACIÓN CON PUNTO ABAJO
        //var str = "\u1E9B\u0323";
        //console.log(str.normalize("NFC")); //COMO NORMALIZAR TEXTOS UTF8
        //console.log(responseJson)//sale undefined quitar .results
        //acf.link_podcast1
        //acf.imagen_podcast1
        //title.rendered Titulo del podcast
        //yoast_head_json.og_description Descripcion del podcast
      })
      .catch((error) => {
        //Error
        alert(JSON.stringify(error));
        console.error(error);
      });
  }

  const [canales, setCanales] = useState();
  //URL: la URL de tu endpoint API
  function postCanales() {
    const response = fetch(
      `https://socialagri.com/agriFM/wp-json/wp/v2/canales/?lang=${language}&per_page=100&order_by=orderhome&order=asc`,
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
        console.log(responseJson); //sale undefined quitar .results
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

  function obtenNombreCanal(value) {
    for (let i = 0; i < nameCanal.length; i++) {
      if (value == nameCanal[i].id) {
        var nombre = nameCanal[i].name;
        return nombre;
      }
    }
  }

  const iconosTematicas = [
    {
      id: "2",
      title: "Avicultura",
      title_pt: "Avicultura",
      name: "Avicultura",
      name_pt: "Avicultura",
      imageUri:
        "https://socialagri.com/agriFM/wp-content/uploads/2021/08/ico-chicken-2.svg",
      imageBackground:
        "https://agrinewss3.s3.amazonaws.com/agriFM/wp-content/uploads/2021/07/19164801/jose-ignacio.png",
    },
    {
      id: "4",
      title: "Nutrición",
      title_pt: "Nutrição",
      name: "Nutrición Animal",
      name_pt: "Nutrição Animal",
      imageUri:
        "https://socialagri.com/agriFM/wp-content/uploads/2021/09/ico-nutrition.svg",
      imageBackground:
        "https://agrinewss3.s3.amazonaws.com/agriFM/wp-content/uploads/2021/07/19164754/fernando-bacha.png",
    },
    {
      id: "8",
      title: "Porcino",
      title_pt: "Suínos",
      name: "Porcino",
      name_pt: "Suínos",
      imageUri:
        "https://socialagri.com/agriFM/wp-content/uploads/2021/08/ico-pig-2.svg",
      imageBackground:
        "https://agrinewss3.s3.amazonaws.com/agriFM/wp-content/uploads/2021/07/21083718/pig.jpg",
    },
    {
      id: "6",
      title: "Rumiantes",
      title_pt: "Ruminantes",
      name: "Rumiantes",
      name_pt: "Ruminantes",
      imageUri:
        "https://socialagri.com/agriFM/wp-content/uploads/2021/08/ico-cow-2.svg",
      imageBackground:
        "https://agrinewss3.s3.amazonaws.com/agriFM/wp-content/uploads/2021/07/20152028/raul-muniz.jpg",
    },
  ];

  //socialagri.com/agriFM/wp-content/themes/agriFM/mobile/img/logo-aginewsfm4.svg
  return (
    <ScrollView style={styles.container}>
      <Image
        source={require("../../../assets/img/logo-aginewsfm4.png")}
        resizeMode="contain"
        style={styles.image}
      />
      <Loading
        isVisible={loading}
        text={
          language === "es" ? "Cargando Podcast..." : "Carregando Podcast..."
        }
      />
      <Avatar
        size="small"
        source={
          language == "es"
            ? require("../../../assets/img/flag-spain.png")
            : require("../../../assets/img/flag-brazil.png")
        }
        rounded
        onPress={() => {
          navigation.push("select-language");
        }}
        activeOpacity={0.7}
        containerStyle={{
          flex: 1,
          marginRight: 20,
          marginTop: -60,
          marginBottom: 20,
          alignSelf: "flex-end",
        }}
      />
      <View>
        <FlatList
          data={iconosTematicas}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("categorias", {
                  id: item.id,
                  image: item.imageBackground,
                  name: language == "es" ? item.name : item.name_pt,
                })
              }
            >
              <View style={styles.borderTematicas}>
                <SvgCssUri style={styles.iconsTematicas} uri={item.imageUri} />
                <Text style={styles.textTematicas}>
                  {language == "es" ? item.title : item.title_pt}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          horizontal={false}
          showsHorizontalScrollIndicator={false}
          style={{ width: windowWidth }}
          contentContainerStyle={styles.list}
          numColumns={4}
          columnWrapperStyle={styles.column}
          key={"#"}
        />
      </View>

      <View style={{ flex: 1, width: windowWidth, padding: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.titleRecomendaciones}>
            {language === "es"
              ? "Recomendaciones de canales"
              : "Recomendações de canais"}
          </Text>
          {/*<TouchableOpacity // AQUÍ ESTÁ EL BOTON VER MÁS
            style={{ flexDirection: "row" }}
            onPress={() => {
              navigation.navigate("todos-canales");
            }}
          >
            <Text style={styles.vermas}>
              "VER"
          </Text>
            <Icon
              type="material-community"
              name="plus-circle-outline"
              onPress={() => {}}
              color="#94C123"
              size={30}
              underlayColor="transparent"
              containerStyle={{ margin: 5, justifyContent: "center" }}
              onPress={() => {
                navigation.navigate("todos-canales");
              }}
            />
          </TouchableOpacity>*/}
        </View>
        {canales ? ( //el metodo slice no funciona muy bien porque combina canales en español y portugués
          <FlatList
            data={canales}
            renderItem={({ item }) =>
              language === "es" ? (
                item.acf.idioma === "Español" && item.acf.orderhome ? (
                  <View>
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate("canales", {
                          id: item.id,
                          name: item.name,
                          image: item.acf.imagen_perfil,
                          idUser: initialState.userID,
                          description: item.description,
                        });
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
                ) : (
                  <View></View>
                )
              ) : item.acf.idioma === "Portugués" && item.count > 0 ? (
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate("canales", {
                        id: item.id,
                        name: item.name,
                        image: item.acf.imagen_perfil,
                        idUser: initialState.userID,
                        description: item.description,
                      });
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
              ) : (
                <View></View>
              )
            }
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            key={"_"}
          />
        ) : (
          <View></View>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Últimos agriPodcasts</Text>

        <FlatList
          data={data}
          key={"."}
          style={{ width: windowWidth }}
          renderItem={({ item }) => (
            <View style={{ color: "#594079", marginBottom: 20 }}>
              <View>
                <View
                  style={{
                    flexDirection: "row",
                    width: windowWidth,
                  }}
                >
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

                    {/* <Text
                      style={{
                        color: "#ffffff",
                        margin: 5,
                        fontWeight: "bold",
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
                                item.link,
                                item.canales[0],
                                item.yoast_head_json.og_description
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
                      //justifyContent:"center",
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
          )}
        />
      </View>
      {intereses1 && intereses2 && intereses3 ? (
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {language === "es"
              ? "Relacionado con tus intereses"
              : "Relacionado aos seus interesses"}
          </Text>
          <FlatList
            data={intereses1.slice(0, 1)}
            key={"Ç"}
            style={{ width: windowWidth }}
            renderItem={({ item }) => (
              <View style={{ color: "#594079", marginBottom: 20 }}>
                <View>
                  <View
                    style={{
                      flexDirection: "row",
                      width: windowWidth,
                    }}
                  >
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
                      {/*<Text
                        style={{
                          color: "#ffffff",
                          margin: 5,
                          fontWeight: "bold",
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
                                      : parseInt(obtenTotalFavoritos(item.id)) +
                                        1
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
                                  item.link,
                                  item.canales[0],
                                  item.yoast_head_json.og_description
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
            )}
          />
          <FlatList
            data={intereses2.slice(0, 1)}
            key={"x"}
            style={{ width: windowWidth }}
            renderItem={({ item }) => (
              <View style={{ color: "#594079", marginBottom: 20 }}>
                <View>
                  <View
                    style={{
                      flexDirection: "row",
                      width: windowWidth,
                    }}
                  >
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

                      {/*<Text
                        style={{
                          color: "#ffffff",
                          margin: 5,
                          fontWeight: "bold",
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
                                      : parseInt(obtenTotalFavoritos(item.id)) +
                                        1
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
                                  item.link,
                                  item.canales[0],
                                  item.yoast_head_json.og_description
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
            )}
          />
          <FlatList
            data={intereses3.slice(0, 1)}
            key={"r"}
            style={{ width: windowWidth }}
            renderItem={({ item }) => (
              <View style={{ color: "#594079", marginBottom: 20 }}>
                <TouchableOpacity>
                  <View
                    style={{
                      flexDirection: "row",
                      width: windowWidth,
                    }}
                  >
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
                      {/*
                      <Text
                        style={{
                          color: "#ffffff",
                          margin: 5,
                          fontWeight: "bold",
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
                                      : parseInt(obtenTotalFavoritos(item.id)) +
                                        1
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
                                  item.link,
                                  item.canales[0],
                                  item.yoast_head_json.og_description
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
                </TouchableOpacity>
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
            )}
          />
        </View>
      ) : (
        <View style={{ width: 600 }}></View>
      )}
      <View style={{ height: 150 }}></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#422c5e",
  },
  image: {
    height: 50,
    alignSelf: "center",
    margin: 10,
    marginBottom: 20,
    marginTop: Platform.OS === "android" ? 45 : 65,
  },
  titleRecomendaciones: {
    marginLeft: 0,
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 10,
    marginTop: 10,
  },
  title: {
    marginLeft: 10,
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 10,
    marginTop: 10,
  },
  vermas: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#94C123",
    marginBottom: 10,
    marginTop: 10,
  },
  titleChannel: {
    flex: 1,
    color: "#ffffff",
    marginBottom: 10,
    textAlign: "center",
    alignSelf: "center",
    fontWeight: "bold",
    width: 100,
  },
  textTematicas: {
    flex: 1,
    textAlign: "center",
    alignSelf: "center",
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 11,
  },
  iconsTematicas: {
    width: 50,
    height: 50,
    marginTop: 10,
    alignSelf: "center",
  },
  borderTematicas: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ba5efd",
    width: 80,
    height: 80,
    margin: 10,
    marginTop: 0,
    marginBottom: 15,
  },
  list: {
    justifyContent: "space-around",
  },
  column: {
    //flexShrink: 1 //no hace falta
    justifyContent: "space-evenly",
  },
  divider: {
    backgroundColor: "#fff",
    margin: 10,
  },
  share: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignSelf: "center",
    justifyContent: "center",
    width: "45%",
  },
  listPodcast: {
    color: "#ffffff",
    marginLeft: 5,
    color: "#94C123",
    fontWeight: "bold",
  },
});
