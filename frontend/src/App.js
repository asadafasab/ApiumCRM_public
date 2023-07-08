import "./App.css";
import React, { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

import { AuthProvider } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import Header from "./components/Header";
import PrivateRoute from "./utils/PrivateRoute";
import ListOfNIPsPage from "./pages/ListOfNIPsPage";
import Concract from "./components/Contract";
import AnnexPage from "./pages/AnnexPage";
import ToFixPage from "./pages/ToFixPage";
import ErrorPage from "./pages/ErrorPage";

const colorsBlue = {
  brand: {
    primary: "#547392",
    hover: "#6d8cab",
    light: "#ced9e3",
  },
};
const colorsPink = {
  brand: {
    primary: "#007392",
    hover: "#6d8cab",
    light: "#ced9e3",
  },
};

function App() {
  const [colors, setColors] = useState(colorsBlue);
  const theme = extendTheme({ colors });
  return (
    <div className="App">
      <ChakraProvider theme={theme}>
        <BrowserRouter>
          <AuthProvider>
            <Header />
            <Routes>
              <Route element={<LoginPage />} path="/login" />
              <Route
                element={
                  <PrivateRoute>
                    <HomePage />
                  </PrivateRoute>
                }
                path="/"
                exact
              />
              <Route
                element={
                  <PrivateRoute>
                    <Concract />
                  </PrivateRoute>
                }
                path="/new"
              />
              <Route
                element={
                  <PrivateRoute>
                    <ListOfNIPsPage />
                  </PrivateRoute>
                }
                path="/nip"
              />
              <Route
                element={
                  <PrivateRoute>
                    <AnnexPage />
                  </PrivateRoute>
                }
                path="/annex"
              />
              <Route
                element={
                  <PrivateRoute>
                    <ErrorPage />
                  </PrivateRoute>
                }
                path="/error"
              />
              <Route
                element={
                  <PrivateRoute>
                    <ToFixPage />
                  </PrivateRoute>
                }
                path="/tofix"
              />
              tofix
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ChakraProvider>
    </div>
  );
}

export default App;
