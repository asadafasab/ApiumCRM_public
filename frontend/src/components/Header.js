import React, { useContext } from "react";
import {
  IconButton,
  Box,
  Flex,
  Button,
  Stack,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  useDisclosure,
  DrawerContent,
  DrawerCloseButton,
  SimpleGrid,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";

import AuthContext from "../context/AuthContext";

const Header = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();
  return (
    <Box bg="brand.primary" px={4}>
      <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
        <IconButton
          ref={btnRef}
          variant="link"
          colorScheme="whiteAlpha"
          onClick={onOpen}
          aria-label="Menu"
          icon={<HamburgerIcon w={8} h={8} color="white" />}
        />
        <Drawer
          isOpen={isOpen}
          placement="left"
          onClose={onClose}
          finalFocusRef={btnRef}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Menu</DrawerHeader>
            <DrawerBody>
              <SimpleGrid columns={1} mt={3} spacing={5}>
                <Box as="a" fontWeight="semibold" href="/">
                  Strona główna
                </Box>
                {user ? (
                  <>
                    <Box as="a" fontWeight="semibold" href="/new">
                      Wprowadź umowy
                    </Box>
                    <Box as="a" fontWeight="semibold" href="/error">
                      Potencjalne błędy
                    </Box>
                    <Box as="a" fontWeight="semibold" href="/annex">
                      Aneksy
                    </Box>
                    <Box as="a" fontWeight="semibold" href="/nip">
                      Lista NIPów
                    </Box>
                    <Box as="a" fontWeight="semibold" href="/tofix">
                      Umowy do zdania/poprawy
                    </Box>
                  </>
                ) : (
                  <></>
                )}
              </SimpleGrid>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
        <Flex alignItems={"center"}>
          <Stack direction={"row"} spacing={7}>
            {user ? (
              <Button
                onClick={logoutUser}
                bg="white"
                color="brand.primary"
                size="sm"
              >
                Wyloguj
              </Button>
            ) : (
              <Box as="a" href="/login">
                <Button to="/login" bg="white" color="brand.primary" size="sm">
                  Zaloguj
                </Button>
              </Box>
            )}
          </Stack>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;
