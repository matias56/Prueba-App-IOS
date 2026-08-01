import React, { useRef } from "react";
import { StyleSheet, View, Image, ScrollView } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import RegisterForm from "../../../../components/Account/RegisterForm";

export default function Register(props) {
  //const toastRef = useRef();
  const { route } = props;
  const { email } = route.params;

  console.log(email);

  return (
    <KeyboardAwareScrollView>
      <ScrollView style={styles.viewForm}>
        <RegisterForm email={email} />
      </ScrollView>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: "100%",
    height: 150,
    marginTop: 20,
  },
  viewForm: {
    paddingRight: 20,
    paddingLeft: 20,
    marginBottom: 100,
  },
});
