import React from "react";
import { StyleSheet } from "react-native";
import { Overlay } from "react-native-elements";

export default function ModalDetallesEspecies(props) {
  const { isVisible, setIsVisible, children } = props;

  const closeModal = () => setIsVisible(false);

  return (
    <Overlay
      isVisible={isVisible}
      overlayStyle={styles.overlay}
      onBackdropPress={closeModal}
    >
      {children}
    </Overlay>
  );
}

const styles = StyleSheet.create({
  overlay: {
    width: "100%",
    backgroundColor: "#9a4dff",
  },
});
