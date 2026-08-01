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

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default function TodosCanales(props) {
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

  const actualizarPodcast = (id, name, image, categories, podcast) => {
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
    });
    //console.log(playPodcast);
    //props.nuevoPodcast = "hola";
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

  const removePodcastLike = (valueID) => {
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
  };

  const addPodcastLike = (valueID) => {
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

  const [intereses2, setIntereses2] = useState();
  //URL: la URL de tu endpoint API
  function postIntereses2() {
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

  const [intereses3, setIntereses3] = useState();
  //URL: la URL de tu endpoint API
  function postIntereses3() {
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

  function onShare() {
    //compartir podcast
    try {
      const result = Share.share({
        message: `Te recomiendo que escuches este podcast de agriFM "${podcastName}"${"\n"}${podcastShare} `,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert("No se ha podido compartir");
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
      })

      .then(function () {});
  };

  const addPodcast = (valueID) => {
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
      })

      .then(function () {});
  };

  const [data, setData] = useState([]);
  //URL: la URL de tu endpoint API
  function postData() {
    const response = fetch(
      `https://socialagri.com/agriFM/wp-json/wp/v2/podcast/?lang=${language}&per_page=5`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
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
      <Loading isVisible={loading} text="Cargando Podcast..." />
      <View style={{ height: 20 }}></View>
      <FlatList
        data={canales}
        contentContainerStyle={styles.list}
        numColumns={3}
        columnWrapperStyle={styles.column}
        renderItem={({ item }) => (
          <View style={{}}>
            <TouchableOpacity
              style={{
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
              }}
              onPress={() => {
                navigation.navigate("canales", {
                  id: item.id,
                  name: item.name,
                  image: item.acf.imagen_perfil,
                  idUser: initialState.userID,
                });
              }}
            >
              <Image
                source={{ uri: item.acf.imagen_perfil }}
                style={{
                  width: 80,
                  height: 80,
                  marginTop: 10,
                  marginBottom: 5,
                }}
                PlaceholderContent={<ActivityIndicator />}
              />

              <Text style={styles.titleChannel}>{item.name}</Text>
            </TouchableOpacity>
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        key={"?"}
        style={{ width: windowWidth }}
      />

      <View style={{ height: 150 }}></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#422c5e",
  },
  image: {
    height: 50,
    alignSelf: "center",
    margin: 10,
    marginBottom: 20,
    marginTop: 25,
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
    //flexShrink: 1, //no hace falta
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
