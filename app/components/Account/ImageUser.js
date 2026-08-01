import React, { useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Avatar, Accessory } from "react-native-elements";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-root-toast";
import axios from "axios";
import initialState from "../../utils/user";

export default function ImageUser(props) {
  const {
    userInfo: { uid, userImage, displayName, email, userID },
    toastRef,
    setLoading,
    setLoadingText,
    imageUser,
    setImageUser,
  } = props;

  const changeAvatar = async () => {
    const resultPermission = await Permissions.askAsync(Permissions.CAMERA);
    const resultPermissionCamera = resultPermission.permissions.camera.status;

    if (resultPermissionCamera === "denied") {
      Toast.show("Es necesario aceptar los permisos de la galeria", {
        position: Toast.positions.CENTER,
      });
      //toastRef.current.show("Es necesario acpetar los permisos de la galeria")
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (result.cancelled) {
        Toast.show("Has cerrado la seleccion de imagenes", {
          position: Toast.positions.CENTER,
        });
        //toastRef.current.show("Has cerrado la seleccion de imagenes");
      } else {
        //console.log(result);
        uploadImage(result);
      }
    }
  };

  const uploadImage = async (result) => {
    const imagenperfil = new FormData();

    imagenperfil.append("image", {
      uri: result.uri,
      name: userID,
      type: "image/jpg",
    });
    imagenperfil.append("Content-Type", "image/jpg");

    axios
      .post(
        "https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/image-user.php",
        imagenperfil,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        initialState.userImage = `${response.data}`;
        setImageUser(`${response.data}`);
      })
      .catch((error) => {
        Toast.show("Error al actualizar el avatar", {
          position: Toast.positions.CENTER,
        });
        //toastRef.current.show("Error al actualizar el avatar")
        console.log(error);
      });
  }; //subir imagen a firebase

  return (
    <View style={styles.viewUserInfo}>
      <Avatar
        rounded
        size="xlarge"
        showEditButton
        containerStyle={styles.userInfoAvatar}
        source={
          imageUser !== ""
            ? { uri: imageUser }
            : require("../../../assets/img/userDefault.png")
        }
      >
        <Accessory style={styles.accessory} onPress={changeAvatar} size={25} />
      </Avatar>
    </View>
  );
}

const styles = StyleSheet.create({
  viewUserInfo: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "#422c5e",
    paddingTop: 30,
    paddingBottom: 30,
  },
  userInfoAvatar: {
    marginRight: 20,
  },

  accessory: {
    borderRadius: 50,
    width: "25%",
    height: "25%",
    backgroundColor: "#594079",
  },
});
