import React, { useState, useEffect } from "react";
import UserGuest from "./UserGuest";
import UserLogged from "./UserLogged";
import Loading from "../../components/Loading";
import initialState from "../../utils/user";

export default function Account() {
  const [login, setLogin] = useState(null);

  useEffect(() => {
    initialState.isAuthorized ? setLogin(true) : setLogin(false);
  }, [initialState.isAuthorized]);

  if (login === null) return <Loading isVisible={true} text="Cargando..." />;

  return login ? <UserLogged /> : <UserGuest />;
}
