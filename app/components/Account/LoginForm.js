import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Picker,
  Text,
  ScrollView,
  DeviceEventEmitter,
  Alert,
} from "react-native";
import { isEmpty } from "lodash";
import { Input, Icon, Button } from "react-native-elements";
import { SvgCssUri } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { validateEmail } from "../../utils/validations";
import Toast from "react-native-root-toast";
import Loading from "../Loading";
import axios from "axios";
import initialState from "../../utils/user";
import lang from "../../utils/language";
import * as SecureStore from "expo-secure-store";
import { ProgressSteps, ProgressStep } from "react-native-progress-steps";

export default function LoginForm(props) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(defaultFormValue());
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(lang.idioma);
  const navigation = useNavigation();

  const onChange = (e, type) => {
    setFormData({ ...formData, [type]: e.nativeEvent.text });
  };

  navigation.setOptions({
    title: language === "es" ? "Iniciar sesión" : "Iniciar sessão",
  });

  async function save(key, value) {
    await SecureStore.setItemAsync(key, value);
  }

  function cambiarPassword(value) {
    return Alert.alert(
      language === "es"
        ? `La contraseña se restablecerá en el siguiente correo electrónico.`
        : `A senha será redefinida no próximo e-mail`,
      `${value}`,
      //`${id}`,
      [
        {
          text: language === "es" ? "Cancelar" : "Cancelar",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: language === "es" ? "Aceptar" : "Aceitar",
          onPress: () => validateRecovery(),
        },
      ]
    );
  }

  const sendReset = () => {
    return Alert.alert(
      language === "es" ? `Email enviado` : `Email enviado`,
      language === "es"
        ? `Revise la bandeja de entrada de su correo`
        : `Verifique sua caixa de entrada de e-mail`,
      //`${id}`,
      [{ text: "OK!", onPress: () => console.log("ok") }]
    );
  };

  const onSubmit = () => {
    if (isEmpty(formData.email) || isEmpty(formData.password)) {
      Toast.show(
        language === "es"
          ? "No puedes dejar la contraseña vacía"
          : "Você não pode deixar a senha vazia",
        {
          position: Toast.positions.CENTER,
        }
      );
    } else if (!validateEmail(formData.email)) {
      Toast.show(
        language === "es"
          ? "El email no es correcto"
          : "O e-mail não está correto",
        {
          position: Toast.positions.CENTER,
        }
      );
    } else {
      axios
        .get(
          `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/login-app.php?email=${formData.email}&password=${formData.password}`
        )
        .then(function (response) {
          // handle success
          console.log(JSON.stringify(response.data[0]));
          if (response.data[0].validation === "ok") {
            save("email", formData.email);
            save("password", formData.password);
            initialState.isAuthorized = true;
            initialState.userID = response.data[0].user;
            initialState.lastname = response.data[0].apellidos;
            initialState.username = response.data[0].nombre;
            initialState.empresa = response.data[0].empresa;
            initialState.userImage = response.data[0].foto;
            initialState.cargo = response.data[0].cargo;
            initialState.actividad = response.data[0].actividad;

            response.data[0].misintereses === null
              ? (initialState.misIntereses = [])
              : (initialState.misIntereses =
                  response.data[0].misintereses.split(","));

            initialState.especies = response.data[0].Especies.split(",");
            initialState.detallesEspecies =
              response.data[0].Detallesotros.split(",");
            initialState.favoritosCanales = response.data[0].favoritos_canales;
            initialState.favoritosPodcast = response.data[0].favoritos_podcast;
            initialState.idioma = response.data[0].idioma;
            initialState.country = response.data[0].id_pais;
            initialState.movil = response.data[0].movil;

            if (response.data[0].like_podcast === null) {
              // establece un array vació si no hay canales favoritos
              initialState.likes = [];
            } else {
              initialState.likes = response.data[0].like_podcast;
            }

            if (initialState.especies === null) {
              // establece un array vació si no hay canales favoritos
              initialState.especies = [];
            } else if (!initialState.especies) {
              initialState.especies = [];
            }

            if (initialState.detallesEspecies === null) {
              // establece un array vació si no hay canales favoritos
              initialState.detallesEspecies = [];
            } else if (!initialState.detallesEspecies) {
              initialState.detallesEspecies = [];
            }

            if (initialState.misIntereses === null) {
              // establece un array vació si no hay canales favoritos
              initialState.misIntereses = [];
            } else if (!initialState.misIntereses) {
              initialState.misIntereses = [];
            }

            if (initialState.favoritosCanales === null) {
              // establece un array vació si no hay canales favoritos
              initialState.favoritosCanales = [];
            } else if (!initialState.favoritosCanales) {
              initialState.favoritosCanales = [];
            }

            if (initialState.favoritosPodcast === null) {
              // establece un array vació si no hay podcast favoritos
              initialState.favoritosPodcast = [];
            } else if (!initialState.favoritosPodcast) {
              initialState.favoritosPodcast = [];
            }

            DeviceEventEmitter.emit("library", {
              favoritosPodcast: initialState.favoritosPodcast,
            });

            console.log(initialState);

            if (initialState.misIntereses.length < 5) {
              navigation.navigate("select-intereses");
            } else {
              navigation.navigate("inicio");
            }
          } else if (
            response.data[0].validation ===
            "No hemos encontrado ningún usuario con este email, por favor cree una cuenta."
          ) {
            Toast.show(
              language === "es"
                ? "No hemos encontrado ningún usuario con este email, por favor cree una cuenta"
                : "Não encontramos nenhum usuário com este e-mail, crie uma conta",
              {
                position: Toast.positions.CENTER,
              }
            );
          } else {
            console.log(JSON.stringify(response.data[0]));
            Toast.show(
              language === "es"
                ? "Revise su email y contraseña"
                : "Verifique seu e-mail e senha",
              {
                position: Toast.positions.CENTER,
              }
            );
          }
        })

        .then(function () {});
    }
  };

  const buttonStylePrevious = {
    color: "#ffffff",
    backgroundColor: "#93bf22",
    padding: 10,
    width: 110,
    textAlign: "center",
    marginRight: -40,
    //color: "#93bf22",
    fontWeight: "bold",
    marginBottom: -20,
    //borderWidth: 1,
    //borderColor: "#CAF348",
  };

  const buttonStyleNext = {
    color: "#ffffff",
    backgroundColor: "#93bf22",
    padding: 10,
    width: 110,
    textAlign: "center",
    marginLeft: -40,
    //color: "#93bf22",
    fontWeight: "bold",
    marginBottom: -20,
    //borderWidth: 1,
    //borderColor: "#CAF348",
  };

  const [validation1, setvalidation1] = useState(true);

  const emailValidateExist = () => {
    if (isEmpty(formData.email)) {
      //setvalidation1(true);
      Toast.show(
        language === "es"
          ? "El email no puede estar vacío"
          : "O e-mail não pode ficar vazio",
        {
          position: Toast.positions.CENTER,
        }
      );
    } else if (!validateEmail(formData.email)) {
      //setvalidation1(true);
      Toast.show(
        language === "es"
          ? "El email no es correcto"
          : "O e-mail não está correto",
        {
          position: Toast.positions.CENTER,
        }
      );
    } else {
      setLoading(true);
      axios
        .get(
          `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/validate-emailapp.php?email=${formData.email}`
        )
        .then(function (response) {
          if (
            response.request._response === "Ya existe una cuenta con ese email"
          ) {
            //navigation.navigate();
            setLoading(false);
            setvalidation1(false);
          } else if (response.request._response === "Email válido") {
            setvalidation1(true);
            setLoading(false);
            navigation.navigate("register", { email: formData.email });
            //setIsVisibleEspecies(true);
          } else {
            setLoading(false);
            //setvalidation1(true);
            Toast.show(
              language === "es"
                ? "Ha ocurrido un error, inténtalo de nuevo más tarde"
                : "Ocorreu um erro, tente novamente mais tarde",
              {
                position: Toast.positions.CENTER,
              }
            );
          }
          console.log(response.request._response);
        })

        .then(function () {});
      //setIsVisibleEspecies(true);

      //console.log("_______________________________");
      //console.log(" ");
      //console.log("nombre:" + formData.name);
      //console.log("appelidos:" + formData.lastName);
    }
  };

  useEffect(() => {
    if (isEmpty(formData.email)) {
      setvalidation1(true);
    } else if (!validateEmail(formData.email)) {
      setvalidation1(true);
    } else {
      axios
        .get(
          `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/validate-emailapp.php?email=${formData.email}`
        )
        .then(function (response) {
          if (
            response.request._response === "Ya existe una cuenta con ese email"
          ) {
            //navigation.navigate();
            setvalidation1(false);
          } else if (response.request._response === "Email válido") {
            setvalidation1(true);
            //setIsVisibleEspecies(true);
          } else {
            setvalidation1(true);
          }
        })

        .then(function () {});
      //setIsVisibleEspecies(true);

      console.log("_______________________________");
      console.log(" ");
      console.log("email:" + formData.email);
    }
  }, [formData.email]);

  const validateRecovery = () => {
    if (isEmpty(formData.email)) {
      Toast.show(
        language === "es"
          ? "Para reiniciar la contraseña necesitas una email"
          : "Para redefinir a senha, você precisa de um e-mail",
        {
          position: Toast.positions.CENTER,
        }
      );
    } else if (!validateEmail(formData.email)) {
      setvalidation1(true);
      Toast.show(
        language === "es"
          ? "El email no es correcto"
          : "O e-mail não está correto",
        {
          position: Toast.positions.CENTER,
        }
      );
    } else {
      axios
        .get(
          `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/validate-recovery-app.php?email=${formData.email}`
        )
        .then(function (response) {
          if (
            response.request._response ===
            "Revise la bandeja de entrada de su correo"
          ) {
            setvalidation1(false);
            sendReset();
            //setIsVisibleEspecies(true);
          } else {
            setvalidation1(true);
            Toast.show(
              language === "es"
                ? "Ha ocurrido un error, inténtalo de nuevo más tarde"
                : "Ocorreu um erro, tente novamente mais tarde",
              {
                position: Toast.positions.CENTER,
              }
            );
          }
          console.log(response.request._response);
        })

        .then(function () {});
      //setIsVisibleEspecies(true);

      console.log("_______________________________");
      console.log(" ");
      console.log("email:" + formData.email);
    }
  };

  return (
    <View style={styles.formContainer}>
      {/*<SvgCssUri
        style={{ width: 150, height: 150, margin: 10, marginBottom: 5 }}
        uri="https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/img/logo-aginewsfm3.svg"
      />*/}
      <View style={{ width: "100%", marginTop: -120 }}>
        <ProgressSteps
          labelFontSize={11}
          labelFontFamily={"sans-serif-condensed"}
          topOffset={-100000}
        >
          <ProgressStep
            label={language === "es" ? "Cuenta" : "Conta"}
            onNext={emailValidateExist}
            errors={validation1}
            nextBtnTextStyle={buttonStylePrevious}
            previousBtnText={language === "es" ? "Volver" : "Voltar"}
            nextBtnText={language === "es" ? "Siguiente" : "Segue"}
            finishBtnText={language === "es" ? "Acceder" : "Acessar"}

            //previousBtnTextStyle={buttonStyleNext}
          >
            <View style={{ alignItems: "center" }}>
              <Input
                defaultValue={formData.email}
                placeholder={
                  language === "es"
                    ? "Correo electronico"
                    : "Correio eletrônico"
                }
                containerStyle={styles.inputForm}
                autoCapitalize="none"
                onChange={(e) => onChange(e, "email")}
                rightIcon={
                  <Icon
                    type="material-community"
                    name="at"
                    iconStyle={styles.iconRight}
                  />
                }
              />
              <Text style={styles.textLogin}>
                {language === "es"
                  ? "Utilice un correo electrónico"
                  : "Coloque seu e-mail"}{" "}
              </Text>
            </View>
          </ProgressStep>

          <ProgressStep
            label={language === "es" ? "Cuenta" : "Conta"}
            onSubmit={onSubmit}
            errors={true}
            nextBtnTextStyle={buttonStylePrevious}
            previousBtnTextStyle={buttonStyleNext}
            previousBtnText={language === "es" ? "Volver" : "Voltar"}
            nextBtnText={language === "es" ? "Siguiente" : "Segue"}
            finishBtnText={language === "es" ? "Acceder" : "Acessar"}
          >
            <Input
              defaultValue={formData.password}
              placeholder={language === "es" ? "Contraseña" : "Senha"}
              containerStyle={styles.inputForm}
              autoCapitalize="none"
              password={true}
              secureTextEntry={showPassword ? false : true}
              onChange={(e) => onChange(e, "password")}
              rightIcon={
                <Icon
                  type="material-community"
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  iconStyle={styles.iconRight}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <Text style={styles.textRegister}>
              {language === "es"
                ? "¿No recuerdas tu contraseña?"
                : "Você não se lembra da sua senha?"}{" "}
            </Text>
            <Text
              style={styles.btnRegister}
              onPress={() => {
                cambiarPassword(formData.email);
              }}
            >
              {language === "es"
                ? "Solicitar nueva contraseña"
                : "Requira nova senha"}
            </Text>
          </ProgressStep>
        </ProgressSteps>
        {/*<Button
          title={language === "es" ? "Iniciar sesión" : "Iniciar sessão"}
          containerStyle={styles.btnContainerLogin}
          buttonStyle={styles.btnLogin}
          onPress={onSubmit}
        />*/}
      </View>
      <Loading
        isVisible={loading}
        text={language === "es" ? "Cargando..." : "Cobrando..."}
      />
    </View>
  );
}

function defaultFormValue() {
  return {
    email: "",
    password: "",
  };
}

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    //alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  inputForm: {
    width: "100%",
    marginTop: 20,
  },
  btnContainerLogin: {
    marginTop: 20,
    width: "95%",
  },
  btnLogin: {
    backgroundColor: "#93bf22",
  },
  iconRight: {
    color: "#c1c1c1",
  },
  textLogin: {
    marginTop: 15,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 58,
    textAlign: "center",
  },
  textRegister: {
    marginTop: 15,
    marginLeft: 10,
    marginRight: 10,
    textAlign: "center",
  },
  btnRegister: {
    color: "#93bf22",
    fontWeight: "bold",
    textAlign: "center",
    borderColor: "#93bf22",
    borderWidth: 2,
    padding: 10,
    marginTop: 15,
    borderRadius: 10,
  },
});
