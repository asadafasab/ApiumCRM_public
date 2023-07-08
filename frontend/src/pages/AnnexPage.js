import React, { useRef } from "react";
import {
  Input,
  Text,
  Button,
  InputGroup,
  VStack,
  useToast,
} from "@chakra-ui/react";
import Api from "../utils/apiCalls";

const AnnexPage = () => {
  const api = new Api();
  const toast = useToast();

  const nipRef = useRef(null);

  const addAnnex = () => {
    api.addAnnex({ nip: nipRef.current.value }).then((resp) => {
      if (resp.response.ok) {
        nipRef.current.value = "";
        toast({
          title: "NIP zaktualizowany.",
          description: "NIP został zaktualizowany.",
          status: "success",
          duration: 4000,
          isClosable: true,
        });
      } else {
        toast({
          title: `Błąd ${resp.response.status}`,
          description: `${resp.response}`,
          status: "error",
          duration: 6000,
          isClosable: true,
        });
      }
    });
  };

  return (
    <>
      <VStack p={10}>
        <Text fontSize="2xl">Zrobione Aneksy</Text>
        <InputGroup>
          <Input placeholder="NIP" ref={nipRef} size="md" />
          <Button onClick={addAnnex}>Dodaj</Button>
        </InputGroup>
      </VStack>
    </>
  );
};
export default AnnexPage;
