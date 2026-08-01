import React from "react";
import { StyleSheet } from "react-native";
import { Overlay } from "react-native-elements";

export default function ModalPlayer(props) {
  const { isVisible, setIsVisible, children } = props;

  const closeModal = () => setIsVisible(false);

  return (
    <Overlay
      isVisible={isVisible}
      overlayStyle={styles.overlay}
      //onBackdropPress={false}
      backdropStyle={{ width: 0, position: "relative" }}
    >
      {children}
    </Overlay>
  );
}

const styles = StyleSheet.create({
  overlay: {
    height: "50%",
    width: "90%",
    backgroundColor: "#fff",
  },
});
