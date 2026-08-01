import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from "react-native";
import { Icon, ScrollView } from "react-native-elements";
import { Audio } from "expo-av";
import { AutoScrollFlatList } from "react-native-autoscroll-flatlist";
import Loading from "../Loading";
import axios from "axios";
import initialState from "../../utils/user";
import playPodcast from "../../utils/playsong";
import NoPlayer from "./NoPlayer";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import lang from "../../utils/language";
import { Overlay } from "react-native-elements/dist/overlay/Overlay";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default function PlayerWidget(props) {
  //const { navigation, route } = props;
  //const { id, name, image, podcast, categories } = route.params;

  //navigation.setOptions({ title: name });

  ///////////// SHARE // FAVORITES // VIEWS

  const [id, setId] = useState(playPodcast.id);
  const [name, setName] = useState(playPodcast.name);
  const [image, setImage] = useState(playPodcast.image);
  const [podcast, setPodcast] = useState(playPodcast.podcast);
  const [categories, setCategories] = useState(playPodcast.categories);
  const [language, setLanguage] = useState(lang.idioma);
  const isFocused = useIsFocused();

  const [podcastShare, setPodcastShare] = useState("");
  const [podcastName, setPodcastName] = useState("");

  //////////// configuración de sonido /////////////////////////////////////////////////

  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(1);
  const [position, setPosition] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const [state, setstate] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setstate(true);
      console.log("change");
    }, [playPodcast])
  );

  useEffect(() => {
    if (playPodcast) {
      setstate(true);
    }
  }, [playPodcast]);

  const onPlaybackStatusUpdate = (status) => {
    setIsPlaying(status.isPlaying);
    setDuration(status.durationMillis);
    setPosition(status.positionMillis);
    //console.log(status);
  };

  function StatePlay() {
    setId(playPodcast.id);
    setName(playPodcast.name);
    setImage(playPodcast.image);
    setPodcast(playPodcast.podcast);
    setCategories(playPodcast.categories);
  }

  useEffect(() => {
    playCurrentSong();
    nombreCanales();
    StatePlay();
    //setstate(true);
    console.log(playPodcast);
  }, [playPodcast, state]);

  const closeWidget = () => {
    playPodcast.id = "";
    playPodcast.name = "";
    playPodcast.image = "";
    playPodcast.podcast = "";
    playPodcast.categories = "";
  };

  const openWidget = () => {
    setId(playPodcast.id);
    setName(playPodcast.name);
    setImage(playPodcast.image);
    setPodcast(playPodcast.podcast);
    setCategories(playPodcast.categories);
  };

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
    return Math.round(position / 60000);
  };

  const hours = () => {
    if (sound === null || duration === null || position === null) {
      return 0;
    }
    return Math.round(position / (60000 * 60));
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
    return Math.round(duration / 60000);
  };

  const totalhours = () => {
    if (sound === null || duration === null || position === null) {
      return 0;
    }
    return Math.round(duration / (60000 * 60));
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
        return nombre;
      }
    }
  }

  //const [state, setstate] = useState(true);

  //function defaultWidget() {
  //  setstate(!state);
  //}

  return state ? (
    <View style={styles.container}>
      <View style={{ flexDirection: "row" }}>
        <Image
          source={{ uri: image }}
          style={{
            width: 45,
            height: 45,
            margin: 10,
            alignSelf: "center",
          }}
        />
        <View
          style={{
            flexDirection: "column",
            marginTop: 10,
            width: (windowWidth / 3) * 2,
          }}
        >
          <Text style={styles.titleSound}>
            {categories.slice(0, 16)}
            {categories.length > 16 ? "..." : ""}
          </Text>
          <Text style={styles.titleCategories}>
            {name.slice(0, 40)}
            {name.length > 40 ? "..." : ""}
          </Text>
        </View>
        {!isLoaded ? (
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
        )}
      </View>
      <View style={styles.totalDuration} />
      <View style={[styles.progress, { width: `${getProgress()}%` }]} />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text
          style={{
            textAlign: "left",
            color: "#94C123",
            margin: 5,
            marginLeft: 10,

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
            color: "#94C123",
            margin: 5,
            marginRight: 10,
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
        {position < duration ? (
          <Icon
            type="material-community"
            name={isLoaded ? "pause-circle-outline" : "play-circle"}
            onPress={() => {
              onPlayPausePress();
              setIsLoaded(!isLoaded);
              addView();
            }}
            color="#94C123"
            size={50}
            underlayColor="transparent"
          />
        ) : (
          <Icon
            type="material-community"
            name={"replay"}
            onPress={() => {
              reload();
            }}
            color="#94C123"
            size={44}
            underlayColor="transparent"
            containerStyle={{
              borderColor: "#94C123",
              borderRadius: 50,
              borderWidth: 3,
            }}
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
    </View>
  ) : (
    <TouchableOpacity
      style={{ backgroundColor: "#422c5e" }}
      onPress={() => {
        setstate(true);
      }}
    >
      <Text
        style={{
          textAlign: "center",
          color: "#ffffff",
          marginTop: 10,
        }}
      >
        Escuchar el podcast seleccionado
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#422c5e",
    //alignItems: "center",
    //justifyContent: "center",
    position: "absolute",
    bottom: 60,
    width: "100%",
    flex: 1,
  },
  titleSound: {
    color: "#94C123",
    fontSize: 15,
    textAlign: "left",
    marginHorizontal: 10,
    marginTop: -5,
    fontWeight: "bold",
  },
  title2: {
    color: "#fff",
    fontSize: 19,
    textAlign: "center",
    marginTop: 15,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  titleCategories: {
    color: "#fff",
    fontSize: 12,
    textAlign: "left",
    marginHorizontal: 10,
  },
  ten: {
    color: "#94C123",
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
});
