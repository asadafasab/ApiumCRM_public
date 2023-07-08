import { useContext } from "react";
import dayjs from "dayjs";
import jwt_decode from "jwt-decode";

import AuthContext from "../context/AuthContext";

const useFetch = () => {
  let config = {};
  let { authTokens, setAuthTokens, setUser, logoutUser, URL } =
    useContext(AuthContext);

  const refreshToken = async (authTokens) => {
    const response = await fetch(URL + "/api/token/refresh/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: authTokens?.refresh }),
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("authTokens", JSON.stringify(data));
      setAuthTokens(data);
      setUser(jwt_decode(data.access));
    } else {
      console.log("error refreshToken: ", response);
      logoutUser();
    }
    return data;
  };

  const originalRequest = async (url, conf) => {
    url = `${URL}${url}`;
    const response = await fetch(url, conf);
    if (response.status !== 200) return { response, data: {} };
    const data = await response.json();
    return { response, data };
  };
  let callFetch = async (url, conf = {}, isFile = false) => {
    const user = jwt_decode(authTokens.access);
    const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;
    if (isExpired) {
      authTokens = await refreshToken(authTokens);
    }
    if (isFile) {
      config["headers"] = {
        Authorization: `Bearer ${authTokens?.access}`,
      };
    } else {
      config["headers"] = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authTokens?.access}`,
      };
    }
    const finalConfig = Object.assign(conf, config);
    const { response, data } = await originalRequest(url, finalConfig);
    return { response, data };
  };
  return callFetch;
};
export default useFetch;
