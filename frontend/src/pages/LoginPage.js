import React, { useContext } from "react";
import { Input, Flex, Heading } from "@chakra-ui/react";
import AuthProvider from "../context/AuthContext";

const LoginPage = () => {
  let { loginUser } = useContext(AuthProvider);

  return (
    <Flex height="100vh" alignItems="center" justifyContent="center">
      <Flex width="%" direction="column" p={12} rounded={7} bg="brand.light">
        <Heading mb={6} color="brand.primary">
          Log in
        </Heading>
        <form onSubmit={loginUser}>
          <Input
            width="sm"
            type="text"
            name="username"
            placeholder="Enter Username"
            bg="white"
            mb={3}
          />
          <br />
          <Input
            width="sm"
            type="password"
            name="password"
            placeholder="Enter Password"
            bg="white"
            mb={6}
          />
          <br />
          <Input
            width="sm"
            type="submit"
            _hover={{ cursor: "pointer" }}
            bg="brand.primary"
            color="white"
            value="Login"
          />
        </form>
      </Flex>
    </Flex>
  );
};

export default LoginPage;
