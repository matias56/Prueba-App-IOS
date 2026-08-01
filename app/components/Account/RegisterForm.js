import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Picker,
  Text,
  ScrollView,
  DeviceEventEmitter,
  Platform,
} from "react-native";
import { Input, Icon, Button, Divider } from "react-native-elements";
import Loading from "../Loading";
import { validateEmail } from "../../utils/validations";
import { size, isEmpty } from "lodash";
import { SvgCssUri } from "react-native-svg";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-root-toast";
import axios from "axios";
import initialState from "../../utils/user";
import lang from "../../utils/language";
import ModalEspecies from "../ModalEspecies";
import ModalDetallesEspecies from "../ModalDetallesEspecies";
import * as SecureStore from "expo-secure-store";
import { ProgressSteps, ProgressStep } from "react-native-progress-steps";

export default function RegisterForm(props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [formData, setFormData] = useState(defaultFormValue(props.email));
  const [language, setLanguage] = useState(lang.idioma);
  const [loading, setLoading] = useState(false);
  const [cargo, setCargo] = useState("1");
  const [actividad, setActividad] = useState("1");
  const [idiomaUser, setIdiomaUser] = useState("1");
  const [country, setCountry] = useState("1");
  const [isVisibleEspecies, setIsVisibleEspecies] = useState(false);
  const [isVisibleDetalles, setIsVisibleDetalles] = useState(false);
  const [listEspecies, setlistEspecies] = useState(initialState.especies);
  const [listDetallesEspecies, setlistDetallesEspecies] = useState(
    initialState.detallesEspecies
  );
  const [update, setUpdate] = useState(false);
  const [updateDetalles, setUpdateDetalles] = useState(false);
  const navigation = useNavigation();

  navigation.setOptions({
    title: language === "es" ? "Registro" : "Cadastro",
  });

  useEffect(() => {
    ListCargos();
    ListActividades();
    ListIdiomas();
    ListPaises();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLanguage(lang.idioma);
      setlistEspecies(initialState.especies);
      setUpdate(false);
    }, [initialState, update])
  );

  useFocusEffect(
    useCallback(() => {
      setLanguage(lang.idioma);
      setlistDetallesEspecies(initialState.detallesEspecies);
      setUpdateDetalles(false);
    }, [initialState, updateDetalles])
  );

  useEffect(() => {
    listaEspecies();
  }, [listEspecies]);

  async function save(key, value) {
    await SecureStore.setItemAsync(key, value);
  }

  const sendEspecies = (value) => {
    if (initialState.especies.find((element) => element === `${value}`)) {
      for (var i = 0; i < initialState.especies.length; i++) {
        if (initialState.especies[i] === `${value}`) {
          initialState.especies.splice(i, 1);
        }
      }
      console.log(initialState.especies);
      setUpdate(true);
    } else if (value) {
      initialState.especies.push(`${value}`);
      console.log(initialState.especies);
      setUpdate(true);
    }
  };

  const [especies, setEspecies] = useState([]);
  //URL: la URL de tu endpoint API
  function listaEspecies() {
    const response = fetch(
      `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/especies-app.php`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((response) => response.json())
      .then((response) => {
        //console.log(response);
        setEspecies(response);
      });
  }

  useEffect(() => {
    listaDetallesEspecies();
  }, [listDetallesEspecies]);

  const [detallesEspecies, setDetallesEspecies] = useState([]);
  //URL: la URL de tu endpoint API
  function listaDetallesEspecies() {
    const response = fetch(
      `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/animals-app.php`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((response) => response.json())
      .then((response) => {
        //console.log(response);
        setDetallesEspecies(response);
      });
  }

  const sendDetallesEspecies = (value) => {
    if (
      initialState.detallesEspecies.find((element) => element === `${value}`)
    ) {
      for (var i = 0; i < initialState.detallesEspecies.length; i++) {
        if (initialState.detallesEspecies[i] === `${value}`) {
          initialState.detallesEspecies.splice(i, 1);
        }
      }
      console.log(initialState.detallesEspecies);
      setUpdateDetalles(true);
    } else if (value) {
      initialState.detallesEspecies.push(`${value}`);
      console.log(initialState.detallesEspecies);
      setUpdateDetalles(true);
    }
  };

  const onSubmitUser = () => {
    if (
      isEmpty(formData.email) ||
      isEmpty(formData.password) ||
      //isEmpty(formData.repeatPassword) ||
      isEmpty(formData.name) ||
      isEmpty(formData.lastName) ||
      isEmpty(formData.empresa) ||
      isEmpty(formData.telefono) ||
      isEmpty(cargo) ||
      isEmpty(actividad) ||
      isEmpty(idiomaUser) ||
      isEmpty(country)
    ) {
      Toast.show(
        language === "es"
          ? "Todos los campos son obligatorios"
          : "Todos os campos são obrigatórios",
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
    } else if (size(formData.password) < 1) {
      Toast.show(
        language === "es"
          ? "La contraseña tiene que tener al menos 1 caracter"
          : "A senha deve ter pelo menos 1 caracter",
        {
          position: Toast.positions.CENTER,
        }
      );
    } else {
      axios
        .get(
          `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/validate-emailapp.php?email=${formData.email}`
        )
        .then(function (response) {
          if (
            response.request._response === "Ya existe una cuenta con ese email"
          ) {
            Toast.show(
              language === "es"
                ? "Este email ya tiene una cuenta asociada, utilize otro"
                : "Este e-mail já tem uma conta associada, use outra",
              {
                position: Toast.positions.CENTER,
              }
            );
          } else if (response.request._response === "Email válido") {
            setIsVisibleEspecies(true);
          } else {
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
      console.log("nombre:" + formData.name);
      console.log("appelidos:" + formData.lastName);
      console.log("empresa:" + formData.empresa);
      console.log("cargo:" + cargo);
      console.log("actividad:" + actividad);
      console.log("idioma:" + idiomaUser);
      console.log("country:" + country);
      console.log("telefono:" + formData.telefono);
      console.log("especies:" + initialState.especies);
      console.log("detalles" + initialState.detallesEspecies);
    }
  };

  const onSubmitEspecies = () => {
    //if (isEmpty(initialState.especies)) {
    //  Toast.show(
    //    language === "es"
    //      ? "Todos los campos son obligatorios"
    //      : "Todos os campos são obrigatórios",
    //    {
    //      position: Toast.positions.CENTER,
    //    }
    //  );
    //} else {
    //console.log("_______________________________");
    //console.log(" ");
    //console.log("nombre:" + formData.name);
    //console.log("appelidos:" + formData.lastName);
    //console.log("empresa:" + formData.empresa);
    //console.log("cargo:" + cargo);
    //console.log("actividad:" + actividad);
    //console.log("idioma:" + idiomaUser);
    //console.log("country:" + country);
    //console.log("telefono:" + formData.telefono);
    //console.log("especies:" + initialState.especies);
    //console.log("detalles" + initialState.detallesEspecies);
    //setIsVisibleEspecies(false);
    //setIsVisibleDetalles(true);
    //}
    setIsVisibleEspecies(false);
  };

  const onSubmitDetalles = () => {
    if (isEmpty(listDetallesEspecies) || isEmpty(listDetallesEspecies)) {
      Toast.show(
        language === "es"
          ? "Escoge al menos una especie y un detalle de especie"
          : "Escolha pelo menos uma espécie e um detalhe da espécie",
        {
          position: Toast.positions.CENTER,
        }
      );
    } else {
      axios
        .post(
          "https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/registroapp.php",
          {
            email: formData.email,
            password: formData.password,
            name: formData.name,
            lastName: formData.lastName,
            empresa: formData.empresa,
            telefono: formData.telefono,
            cargo: cargo,
            actividad: actividad,
            idioma: idiomaUser,
            country: country,
            especies: initialState.especies.toString(),
            detalles: initialState.detallesEspecies.toString(),
            language: language,
          }
        )
        .then(function (response) {
          setLoading(true);
          console.log(response);
          if (response.request._response === "Email ya registrado") {
            Toast.show(
              language === "es"
                ? "Este email ya tiene una cuenta asociada, utilize otro"
                : "Este e-mail já tem uma conta associada, use outra",
              {
                position: Toast.positions.CENTER,
              }
            );
            setLoading(false);
          } else if (response.request._response[0] === "I") {
            axios
              .get(
                `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/login-app.php?email=${formData.email}&password=${formData.password}`
              )
              .then(function (response) {
                // handle success
                console.log(JSON.stringify(response.data[0]));
                console.log("_______________________________");
                console.log(" ");
                console.log("nombre:" + formData.name);
                console.log("appelidos:" + formData.lastName);
                console.log("empresa:" + formData.empresa);
                console.log("cargo:" + cargo);
                console.log("actividad:" + actividad);
                console.log("idioma:" + idiomaUser);
                console.log("country:" + country);
                console.log("telefono:" + formData.telefono);
                console.log("especies:" + initialState.especies);
                console.log("detalles:" + initialState.detallesEspecies);

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

                  initialState.misIntereses = response.data[0].misintereses;
                  initialState.especies = response.data[0].Especies.split(",");
                  initialState.detallesEspecies =
                    response.data[0].Detallesotros.split(",");
                  initialState.idioma = response.data[0].idioma;
                  initialState.country = response.data[0].id_pais;
                  initialState.movil = response.data[0].movil;

                  if (response.data[0].like_podcast === null) {
                    // establece un array vació si no hay canales favoritos
                    initialState.likes = [];
                  } else {
                    initialState.likes = response.data[0].like_podcast;
                  }

                  if (initialState.detallesEspecies === null) {
                    // establece un array vació si no hay canales favoritos
                    initialState.detallesEspecies = [];
                  } else if (!initialState.detallesEspecies) {
                    initialState.detallesEspecies = [];
                  }

                  if (initialState.especies === null) {
                    // establece un array vació si no hay canales favoritos
                    initialState.especies = [];
                  } else if (!initialState.especies) {
                    initialState.especies = [];
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
                  setLoading(false);

                  console.log(initialState);
                  //setIsVisibleDetalles(false);
                  navigation.navigate("select-intereses");
                } else if (
                  response.data[0].validation ===
                  "No hemos encontrado ningún usuario con este email, por favor cree una cuenta."
                ) {
                  setLoading(false);
                  Toast.show(
                    language === "es"
                      ? "No hemos encontrado ningún usuario con este email, por favor cree una cuenta"
                      : "Não encontramos nenhum usuário com este e-mail, por favor crie uma conta",
                    {
                      position: Toast.positions.CENTER,
                    }
                  );
                } else {
                  setLoading(false);
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
        })
        .catch(function (error) {
          console.log(error);
          setLoading(false);
        });
    }
  };

  const [cargos, setCargos] = useState([]);

  function ListCargos() {
    const response = fetch(
      `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/cargo-app.php`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((response) => response.json())
      .then((response) => {
        //console.log(response);
        setCargos(response);
      });
  }

  const [actividades, setActividades] = useState([]);

  function ListActividades() {
    const response = fetch(
      `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/actividad-app.php`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((response) => response.json())
      .then((response) => {
        //console.log(response);
        setActividades(response);
      });
  }

  const [idiomas, setIdiomas] = useState([]);

  function ListIdiomas() {
    const response = fetch(
      `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/idioma-app.php`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((response) => response.json())
      .then((response) => {
        //console.log(response);
        setIdiomas(response);
      });
  }

  const [paises, setPaises] = useState([]);

  function ListPaises() {
    if (language === "es") {
      const response = fetch(
        `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/country-app-es.php`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      )
        .then((response) => response.json())
        .then((response) => {
          //console.log(response);
          setPaises(response);
        });
    } else {
      const response = fetch(
        `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/country-app-pt.php`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      )
        .then((response) => response.json())
        .then((response) => {
          //console.log(response);
          setPaises(response);
        });
    }
  }

  const onChange = (e, type) => {
    setFormData({ ...formData, [type]: e.nativeEvent.text });
  };

  const buttonStylePrevious = {
    color: "#ffffff",
    backgroundColor: "#93bf22",
    padding: 10,
    width: 110,
    textAlign: "center",
    marginRight: -30,
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
    marginLeft: -30,
    fontWeight: "bold",
    marginBottom: -20,
    //borderWidth: 1,
    //borderColor: "#CAF348",
  };

  const [validation1, setvalidation1] = useState(true);
  const [validation2, setvalidation2] = useState(true);
  const [validation3, setvalidation3] = useState(true);
  const [validation4, setvalidation4] = useState(true);

  const validatePass = () => {
    if (isEmpty(formData.email) || isEmpty(formData.password)) {
      setvalidation1(true);
      Toast.show(
        language === "es"
          ? "Todos los campos son obligatorios"
          : "Todos os campos são obrigatórios",
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
    } else if (size(formData.password) < 1) {
      setvalidation1(true);
      Toast.show(
        language === "es"
          ? "La contraseña tiene que tener al menos 1 caracter"
          : "A senha deve ter pelo menos 1 caracter",
        {
          position: Toast.positions.CENTER,
        }
      );
    } else {
      axios
        .get(
          `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/validate-emailapp.php?email=${formData.email}`
        )
        .then(function (response) {
          if (
            response.request._response === "Ya existe una cuenta con ese email"
          ) {
            Toast.show(
              language === "es"
                ? "Este email ya tiene una cuenta asociada, utilize otro"
                : "Este e-mail já tem uma conta associada, use outra",
              {
                position: Toast.positions.CENTER,
              }
            );
            setvalidation1(true);
          } else if (response.request._response === "Email válido") {
            setvalidation1(false);
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
      console.log("nombre:" + formData.name);
      console.log("appelidos:" + formData.lastName);
    }
  };

  useEffect(() => {
    if (isEmpty(formData.email) || isEmpty(formData.password)) {
      setvalidation1(true);
    } else if (!validateEmail(formData.email)) {
      setvalidation1(true);
    } else if (size(formData.password) < 1) {
      setvalidation1(true);
    } else {
      axios
        .get(
          `https://socialagri.com/agriFM/wp-content/themes/agriFM/laptop/ajax/validate-emailapp.php?email=${formData.email}`
        )
        .then(function (response) {
          if (response.request._response === "Email válido") {
            setvalidation1(false);
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
      console.log("password:" + formData.password);
    }
  }, [formData.email, formData.password]);

  const validateDatos = () => {
    if (
      isEmpty(formData.name) ||
      isEmpty(formData.lastName) ||
      isEmpty(formData.empresa) ||
      isEmpty(formData.telefono)
    ) {
      setvalidation2(true);
      Toast.show(
        language === "es"
          ? "Todos los campos son obligatorios"
          : "Todos os campos são obrigatórios",
        {
          position: Toast.positions.CENTER,
        }
      );
    } else if (isNaN(formData.telefono)) {
      setvalidation2(true);
      Toast.show(
        language === "es"
          ? "el teléfono tiene que ser un número"
          : "o telefone tem que ser um número",
        {
          position: Toast.positions.CENTER,
        }
      );
    } else {
      setvalidation2(false);
    }
  };

  useEffect(() => {
    if (
      isEmpty(formData.name) ||
      isEmpty(formData.lastName) ||
      isEmpty(formData.empresa) ||
      isEmpty(formData.telefono)
    ) {
      setvalidation2(true);
    } else if (isNaN(formData.telefono)) {
      setvalidation2(true);
    } else {
      setvalidation2(false);
    }
  }, [formData.name, formData.lastName, formData.empresa, formData.telefono]);

  function obtenNombreCargoES(value) {
    for (let i = 0; i < cargos.length; i++) {
      if (value == cargos[i].id) {
        return cargos[i].nombrees;
      }
    }
  }

  function obtenNombreCargoPT(value) {
    for (let i = 0; i < cargos.length; i++) {
      if (value == cargos[i].id) {
        return cargos[i].nombrept;
      }
    }
  }

  function obtenNombreActividadES(value) {
    for (let i = 0; i < actividades.length; i++) {
      if (value == actividades[i].id) {
        return actividades[i].nombrees;
      }
    }
  }

  function obtenNombreActividadPT(value) {
    for (let i = 0; i < actividades.length; i++) {
      if (value == actividades[i].id) {
        return actividades[i].nombrept;
      }
    }
  }

  function obtenNombreIdiomaES(value) {
    for (let i = 0; i < idiomas.length; i++) {
      if (value == idiomas[i].id) {
        return idiomas[i].nombrees;
      }
    }
  }

  function obtenNombreIdiomaPT(value) {
    for (let i = 0; i < idiomas.length; i++) {
      if (value == idiomas[i].id) {
        return idiomas[i].nombrept;
      }
    }
  }

  function obtenNombrePaisES(value) {
    for (let i = 0; i < paises.length; i++) {
      if (value == paises[i].id) {
        return paises[i].nombrees;
      }
    }
  }

  function obtenNombrePaisPT(value) {
    for (let i = 0; i < paises.length; i++) {
      if (value == paises[i].id) {
        return paises[i].nombrept;
      }
    }
  }

  return (
    <View style={styles.formContainer}>
      <View style={{ flex: 1 }}>
        <ProgressSteps
          labelFontSize={11}
          labelFontFamily={"sans-serif-condensed"}
        >
          <ProgressStep
            label={language === "es" ? "Cuenta" : "Conta"}
            nextBtnTextStyle={buttonStylePrevious}
            onNext={validatePass}
            errors={validation1}
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
              {/*<Input
                placeholder={
                  language === "es" ? "Repetir contraseña" : "repetir a senha"
                }
                containerStyle={styles.inputForm}
                autoCapitalize="none"
                password={true}
                secureTextEntry={showRepeatPassword ? false : true}
                onChange={(e) => onChange(e, "repeatPassword")}
                rightIcon={
                  <Icon
                    type="material-community"
                    name={
                      showRepeatPassword ? "eye-off-outline" : "eye-outline"
                    }
                    iconStyle={styles.iconRight}
                    onPress={() => setShowRepeatPassword(!showRepeatPassword)}
                  />
                }
              />*/}
            </View>
          </ProgressStep>
          <ProgressStep
            label={
              language === "es"
                ? `Datos del${"\n"} usuario`
                : `Dados do${"\n"} usuário`
            }
            nextBtnTextStyle={buttonStylePrevious}
            previousBtnTextStyle={buttonStyleNext}
            onNext={validateDatos}
            errors={validation2}
            previousBtnText={language === "es" ? "Volver" : "Voltar"}
            nextBtnText={language === "es" ? "Siguiente" : "Segue"}
            finishBtnText={language === "es" ? "Acceder" : "Acessar"}
          >
            <View style={{ alignItems: "center" }}>
              <Input
                defaultValue={formData.name}
                placeholder={language === "es" ? "Nombre" : "Nome"}
                containerStyle={styles.inputForm}
                autoCapitalize="words"
                onChange={(e) => onChange(e, "name")}
              />
              <Input
                defaultValue={formData.lastName}
                placeholder={language === "es" ? "Apellidos" : "Sobrenomes"}
                containerStyle={styles.inputForm}
                autoCapitalize="words"
                onChange={(e) => onChange(e, "lastName")}
              />
              <Input
                defaultValue={formData.empresa}
                placeholder="Empresa"
                containerStyle={styles.inputForm}
                autoCapitalize="words"
                onChange={(e) => onChange(e, "empresa")}
              />
              <Input
                defaultValue={formData.telefono}
                placeholder={language === "es" ? "Teléfono" : "Telefone"}
                containerStyle={styles.inputForm}
                autoCapitalize="none"
                onChange={(e) => onChange(e, "telefono")}
                keyboardType="numeric"
              />
            </View>
          </ProgressStep>
          <ProgressStep
            label={
              language === "es"
                ? `Datos${"\n"} profesionales`
                : `Dados${"\n"} profissionais`
            }
            nextBtnTextStyle={buttonStylePrevious}
            previousBtnTextStyle={buttonStyleNext}
            previousBtnText={language === "es" ? "Volver" : "Voltar"}
            nextBtnText={language === "es" ? "Siguiente" : "Segue"}
            finishBtnText={language === "es" ? "Acceder" : "Acessar"}
          >
            <View style={{ alignItems: "center", marginTop: 30 }}>
              <View style={{ width: "100%", marginBottom: 5 }}>
                <Text style={styles.labelTitle}>
                  {language === "es"
                    ? `Cargo seleccionado: ${obtenNombreCargoES(cargo)}`
                    : `Cargo selecionado: ${obtenNombreCargoPT(cargo)}`}
                </Text>
              </View>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={cargo}
                  style={{
                    width: Platform.OS === "android" ? "95%" : "60%",
                    color: Platform.OS === "android" ? "#fff" : "#444444",
                  }}
                  onValueChange={(itemValue) => setCargo(itemValue)}
                  numberOfLines={"2"}
                >
                  {cargos.map((l, i) => (
                    <Picker.Item
                      color="#422c5e"
                      label={language === "es" ? l.nombrees : l.nombrept}
                      value={l.id}
                    />
                  ))}
                </Picker>
              </View>
              <View style={{ width: "100%", marginBottom: 5 }}>
                <Text style={styles.labelTitle}>
                  {language === "es"
                    ? `Actividad seleccionada: ${obtenNombreActividadES(
                        actividad
                      )}`
                    : `Atividade selecionada: ${obtenNombreActividadPT(
                        actividad
                      )}`}
                </Text>
              </View>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={actividad}
                  style={{
                    width: Platform.OS === "android" ? "95%" : "60%",
                    color: Platform.OS === "android" ? "#fff" : "#444444",
                  }}
                  onValueChange={(itemValue) => setActividad(itemValue)}
                >
                  {actividades.map((l, i) => (
                    <Picker.Item
                      color="#422c5e"
                      label={language === "es" ? l.nombrees : l.nombrept}
                      value={l.id}
                    />
                  ))}
                </Picker>
              </View>
              <View style={{ width: "100%", marginBottom: 5 }}>
                <Text style={styles.labelTitle}>
                  {language === "es"
                    ? `Idioma seleccionado: ${obtenNombreIdiomaES(idiomaUser)}`
                    : `Idioma selecionado: ${obtenNombreIdiomaPT(idiomaUser)}`}
                </Text>
              </View>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={idiomaUser}
                  style={{
                    width: Platform.OS === "android" ? "95%" : "60%",
                    color: Platform.OS === "android" ? "#fff" : "#444444",
                  }}
                  onValueChange={(itemValue) => setIdiomaUser(itemValue)}
                >
                  {idiomas.map((l, i) => (
                    <Picker.Item
                      color="#422c5e"
                      label={language === "es" ? l.nombrees : l.nombrept}
                      value={l.id}
                    />
                  ))}
                </Picker>
              </View>
              <View style={{ width: "100%", marginBottom: 5 }}>
                <Text style={styles.labelTitle}>
                  {language === "es"
                    ? `País seleccionado: ${obtenNombrePaisES(country)}`
                    : `País selecionado: ${obtenNombrePaisPT(country)}`}
                </Text>
              </View>
              <View style={styles.lastPickerContainer}>
                <Picker
                  selectedValue={country}
                  style={{
                    width: Platform.OS === "android" ? "95%" : "60%",
                    color: Platform.OS === "android" ? "#fff" : "#444444",
                  }}
                  onValueChange={(itemValue) => setCountry(itemValue)}
                >
                  {paises.map((l, i) => (
                    <Picker.Item
                      color="#422c5e"
                      label={language === "es" ? l.nombrees : l.nombrept}
                      value={l.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </ProgressStep>
          <ProgressStep
            label={language === "es" ? "Especies" : "Espécies"}
            nextBtnTextStyle={buttonStylePrevious}
            previousBtnTextStyle={buttonStyleNext}
            onSubmit={onSubmitDetalles}
            previousBtnText={language === "es" ? "Volver" : "Voltar"}
            nextBtnText={language === "es" ? "Siguiente" : "Segue"}
            finishBtnText={language === "es" ? "Acceder" : "Acessar"}
          >
            <View style={{ alignItems: "center", marginBottom: 30 }}>
              <Button
                title={
                  language === "es"
                    ? "Seleccione las especies"
                    : "Selecione a espécie"
                }
                containerStyle={styles.btnContainerRegister}
                buttonStyle={{ backgroundColor: "#93bf22", height: 50 }}
                onPress={() => setIsVisibleEspecies(true)}
                titleStyle={{ fontSize: 15 }}
              />
              <Button
                title={
                  language === "es"
                    ? "Seleccione detalles de especies"
                    : "Selecionar detalhes da espécie"
                }
                containerStyle={styles.btnContainerRegister}
                buttonStyle={{ backgroundColor: "#93bf22", height: 50 }}
                onPress={() => setIsVisibleDetalles(true)}
                titleStyle={{ fontSize: 15 }}
              />
            </View>
          </ProgressStep>
        </ProgressSteps>
      </View>

      {
        //<View style={styles.divider}></View>
      }

      <ModalEspecies
        isVisible={isVisibleEspecies}
        setIsVisible={setIsVisibleEspecies}
      >
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#9a4dff",
          }}
        >
          <Text
            style={{
              fontSize: 22,
              alignSelf: "center",
              margin: 20,
              marginTop: 50,
              fontWeight: "bold",
              color: "#fff",
            }}
          >
            {language === "es"
              ? "Seleccione las especies"
              : "Selecione a espécie"}
          </Text>
          {especies.map((l, i) => (
            <View style={{ flexDirection: "row" }}>
              {l.id == initialState.especies[0] ||
              l.id == initialState.especies[1] ||
              l.id == initialState.especies[2] ||
              l.id == initialState.especies[3] ||
              l.id == initialState.especies[4] ||
              l.id == initialState.especies[5] ||
              l.id == initialState.especies[6] ? (
                <Icon
                  name="checkbox-marked"
                  type="material-community"
                  color="#fff"
                  size={30}
                  onPress={() => {
                    sendEspecies(l.id);
                  }}
                />
              ) : (
                <Icon
                  name="checkbox-blank"
                  type="material-community"
                  color="#fff"
                  size={30}
                  onPress={() => {
                    sendEspecies(l.id);
                  }}
                />
              )}

              <Text
                onPress={() => {
                  sendEspecies(l.id);
                }}
                style={{
                  width: 250,
                  fontSize: 18,
                  marginLeft: 15,
                  color: "#fff",
                }}
              >
                {language === "es" ? l.nombrees : l.nombrept}
              </Text>
            </View>
          ))}
          <Button
            title={language === "es" ? "Guardar especies" : "Salvar espécies"}
            containerStyle={styles.btnContainerLogin}
            buttonStyle={styles.btnLogin}
            onPress={onSubmitEspecies}
          />
          {/*<Button
            title={language === "es" ? "Cerrar" : "Fechar"}
            containerStyle={styles.btnContainerLogin}
            buttonStyle={styles.btnClose}
            onPress={() => {
              setIsVisibleEspecies(false);
              setlistEspecies([]);
              initialState.especies = [];
            }}
          />*/}

          <View style={{ marginBottom: 100 }}></View>
        </View>
      </ModalEspecies>
      <ModalDetallesEspecies
        isVisible={isVisibleDetalles}
        setIsVisible={setIsVisibleDetalles}
      >
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#9a4dff",
          }}
        >
          <Text
            style={{
              fontSize: 22,
              alignSelf: "center",
              margin: 20,
              marginTop: 50,
              fontWeight: "bold",
              color: "#fff",
            }}
          >
            {language === "es"
              ? "Seleccione detalles de especies"
              : "Selecionar detalhes da espécie"}
          </Text>
          {detallesEspecies.map((l, i) => (
            <View style={{ flexDirection: "row" }}>
              {l.id == initialState.detallesEspecies[0] ||
              l.id == initialState.detallesEspecies[1] ||
              l.id == initialState.detallesEspecies[2] ||
              l.id == initialState.detallesEspecies[3] ||
              l.id == initialState.detallesEspecies[4] ||
              l.id == initialState.detallesEspecies[5] ||
              l.id == initialState.detallesEspecies[6] ||
              l.id == initialState.detallesEspecies[7] ||
              l.id == initialState.detallesEspecies[8] ||
              l.id == initialState.detallesEspecies[9] ||
              l.id == initialState.detallesEspecies[10] ||
              l.id == initialState.detallesEspecies[11] ||
              l.id == initialState.detallesEspecies[12] ||
              l.id == initialState.detallesEspecies[13] ||
              l.id == initialState.detallesEspecies[14] ||
              l.id == initialState.detallesEspecies[15] ||
              l.id == initialState.detallesEspecies[16] ||
              l.id == initialState.detallesEspecies[17] ||
              l.id == initialState.detallesEspecies[18] ||
              l.id == initialState.detallesEspecies[19] ||
              l.id == initialState.detallesEspecies[20] ||
              l.id == initialState.detallesEspecies[21] ||
              l.id == initialState.detallesEspecies[22] ? (
                <Icon
                  name="checkbox-marked"
                  type="material-community"
                  color="#fff"
                  size={30}
                  onPress={() => {
                    sendDetallesEspecies(l.id);
                  }}
                />
              ) : (
                <Icon
                  name="checkbox-blank"
                  type="material-community"
                  color="#fff"
                  size={30}
                  onPress={() => {
                    sendDetallesEspecies(l.id);
                  }}
                />
              )}

              <Text
                onPress={() => {
                  sendDetallesEspecies(l.id);
                }}
                style={{
                  width: 250,
                  fontSize: 18,
                  marginLeft: 15,
                  color: "#fff",
                }}
              >
                {language === "es" ? l.nombrees : l.nombrept}
              </Text>
            </View>
          ))}

          <Button
            title={
              language === "es"
                ? "Guardar detalles de especies"
                : "Salvar detalhes da espécie"
            }
            containerStyle={styles.btnContainerLogin}
            buttonStyle={styles.btnLogin}
            onPress={() => setIsVisibleDetalles(false)}
          />
          {/*<Button
            title={language === "es" ? "Cerrar" : "Fechar"}
            containerStyle={styles.btnContainerLogin}
            buttonStyle={styles.btnClose}
            onPress={() => {
              setIsVisibleDetalles(false);
              setIsVisibleEspecies(true);
            }}
          />*/}
          <View style={{ marginBottom: 100 }}></View>
        </ScrollView>
      </ModalDetallesEspecies>
      {/*<Button
        title={language === "es" ? "Siguiente" : "Segue"}
        containerStyle={styles.btnContainerRegister}
        buttonStyle={styles.btnStyle}
        onPress={onSubmitUser}
        titleStyle={{ fontSize: 19 }}
      />*/}
      <Loading
        isVisible={loading}
        text={language === "es" ? "Creando cuenta" : "Criando conta"}
      />
    </View>
  );
}

function defaultFormValue(value) {
  return {
    name: "",
    lastName: "",
    empresa: "",
    email: value,
    password: "",
    repeatPassword: "",
    telefono: "",
  };
}

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    //width: "100%",
    //marginTop: 30,
  },
  inputForm: {
    width: "100%",
    marginTop: 20,
  },
  btnContainerRegister: {
    marginTop: 20,
    width: "100%",
  },
  btnRegister: {
    backgroundColor: "#93bf22",
  },
  iconRight: {
    color: "#c1c1c1",
  },
  divider: {
    backgroundColor: "#93bf22",
    width: "50%",
    marginTop: 30,
    marginBottom: 20,
    height: 2,
  },
  pickerContainer: {
    width: "95%",
    alignItems: "center",
    backgroundColor: Platform.OS === "android" ? "#9a4dff" : "#ffffff",
    marginBottom: 20,
    borderBottomColor: "#fff",
    borderBottomWidth: 2,
  },
  labelTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#424242",
    marginLeft: 10,
  },
  lastPickerContainer: {
    width: "95%",
    alignItems: "center",
    backgroundColor: Platform.OS === "android" ? "#9a4dff" : "#ffffff",
    marginBottom: 30,
    borderBottomColor: "#fff",
    borderBottomWidth: 2,
  },
  btnStyle: {
    backgroundColor: "#93bf22",
    height: 60,
  },
  btnContainerLogin: {
    marginTop: 20,
    width: "90%",
  },
  btnLogin: {
    backgroundColor: "#93bf22",
    paddingTop: 20,
    paddingBottom: 20,
  },
  btnClose: {
    backgroundColor: "#F64141",
    paddingTop: 20,
    paddingBottom: 20,
  },
});
