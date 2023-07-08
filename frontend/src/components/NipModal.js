import React, { useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  Checkbox,
  Button,
  VStack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";

import AlertPop from "./AlertPop";
import Api from "../utils/apiCalls";

const NewNipModal = ({
  updateNipsUi,
  current,
  setCurrent,
  isOpen,
  onClose,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();
  const api = new Api();
  const toast = useToast();
  const onSubmit = (data) => {
    if (data.blocade_end === "") {
      data.blocade_end = new Date(3000, 1, 1, 0, 0, 0, 0);
    }
    if (isUpdate) {
      data.id = current.id;
      api.updateNip(data).then((resp) => {
        if (resp.response.ok) {
          onClose();
          updateNipsUi(resp.data, "update");
          toast({
            title: "NIP zaktualizowany.",
            description: "NIP został zaktualizowany.",
            status: "success",
            duration: 6000,
            isClosable: true,
          });
          reset({});
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
    } else {
      api.addNip(data).then((resp) => {
        if (resp.response.ok) {
          onClose();
          updateNipsUi(resp.data, "add");
          toast({
            title: "NIP dodany.",
            description: "NIP został dodany.",
            status: "success",
            duration: 6000,
            isClosable: true,
          });
          reset({});
        } else {
          toast({
            title: "Błąd",
            description: `Błąd ${resp.response.status}`,
            status: "error",
            duration: 6000,
            isClosable: true,
          });
        }
      });
    }
  };
  const onDelete = () => {
    api.deleteNip(current.id).then((resp) => {
      if (resp.response.ok || resp.response.status === 204) {
        updateNipsUi(current, "delete");
        onClose();
        toast({
          title: "NIP usunięty.",
          description: "NIP został usunięty.",
          status: "success",
          duration: 6000,
          isClosable: true,
        });
        reset({});
      } else {
        toast({
          title: "Błąd",
          description: `Błąd ${resp.response.status}`,
          status: "error",
          duration: 6000,
          isClosable: true,
        });
      }
    });
  };
  const isUpdate = current && current.hasOwnProperty("id") ? true : false;
  const close = () => {
    setCurrent({});
    reset({});
    onClose();
  };
  useEffect(() => {
    if (isUpdate) {
      setValue("nip", current.nip);
      setValue("takeover", current.takeover);
      if (!current.blocade_end.includes("9999")) {
        setValue("blocade_end", current.blocade_end.substr(0, 16));
      }
      setValue("company_name", current.company_name);
      setValue("blocked_by", current.blocked_by);
      setValue("client_of", current.client_of);
    }
  }, [isOpen, current]);
  return (
    <Modal isOpen={isOpen} onClose={() => close()}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Blokada NIPu</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack align="left">
              <Text pl={1} fontSize="lg">
                NIP
              </Text>
              <Input
                type="number"
                {...register("nip", {
                  required: "Wpisz poprawny NIP",
                  minLength: 10,
                  maxLength: 10,
                })}
              />
              {errors.nip && <AlertPop title={errors.nip.message} />}
              <Checkbox p={1} {...register("takeover")}>
                NIP do przejecia
              </Checkbox>
              <Text pl={1} fontSize="lg">
                Data końca blokady
              </Text>
              <Input type="datetime-local" {...register("blocade_end", {})} />
              {errors.blocade_end && (
                <AlertPop title={errors.blocade_end.message} />
              )}
              <Text pl={1} fontSize="lg">
                Nazwa firmy
              </Text>
              <Input
                type="text"
                placeholder="Nazwa firmy"
                {...register("company_name", {
                  required: "Wpisz nazwę firmy.",
                  minLength: 2,
                  maxLength: 200,
                })}
              />
              {errors.company_name && (
                <AlertPop title={errors.company_name.message} />
              )}
              <Text pl={1} fontSize="lg">
                Zablokowane przez
              </Text>
              <Input
                type="text"
                {...register("blocked_by", {
                  minLength: 3,
                  maxLength: 200,
                })}
              />
              <Text pl={1} fontSize="lg">
                Ofertowany przez
              </Text>
              <Input
                type="text"
                {...register("client_of", {
                  required: "Wpisz imię(imiona) i nazwisko/a.",
                  minLength: 3,
                  maxLength: 256,
                })}
              />
              {errors.client_of && (
                <AlertPop title={errors.client_of.message} />
              )}
            </VStack>
          </form>
        </ModalBody>

        <ModalFooter>
          {isUpdate ? (
            <Button mr={5} colorScheme="red" onClick={onDelete}>
              Usuń
            </Button>
          ) : (
            <></>
          )}
          <Button onClick={handleSubmit(onSubmit)}>
            {isUpdate ? "Aktualizuj" : "Dodaj"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
export default NewNipModal;
