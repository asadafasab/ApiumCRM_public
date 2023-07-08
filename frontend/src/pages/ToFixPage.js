import React, { useContext, useEffect, useState } from "react";
import {
  useDisclosure,
  Textarea,
  Input,
  Button,
  Text,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Container,
  Heading,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";

import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import roboto from "../Roboto-Light.ttf";

import Api from "../utils/apiCalls";
import AlertPop from "../components/AlertPop";
import FilterToFix from "../components/FilterToFix";

const ToFixPage = () => {
  const api = new Api();
  const toast = useToast();
  const [update, setUpdate] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [contracts, setContracts] = useState();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();
  const editModal = (contract) => {
    setUpdate(true);
    setValue("pk", contract.id);
    setValue("nip", contract.nip);
    setValue("salesman", contract.salesman);
    setValue("branch", contract.branch);
    setValue("secretary", contract.secretary);
    setValue("name", contract.name);
    setValue("date_signed", contract.date_signed);
    setValue("info", contract.info);
    setValue("status", contract.status);
    onOpen();
  };
  const clearValues = () => {
    setValue("pk", "");
    setValue("nip", "");
    setValue("salesman", "");
    setValue("branch", "");
    setValue("name", "");
    setValue("secretary", "");
    setValue("date_signed", "");
    setValue("info", "");
    setValue("status", "18");
  };
  const deleteContractToFix = (data) => {
    console.log(data);
    api
      .deleteContractToFix(data.pk)
      .then((resp) => {
        setContracts(resp.data);
        if (resp.response.ok) {
          toast({
            title: "Usunięto",
            description: "Usunięto.",
            status: "success",
            duration: 6000,
            isClosable: true,
          });
          onClose();
          clearValues();
        } else {
          alert(resp.response.status);
        }
      })
      .catch((error) => {
        alert(error);
      });
    setUpdate(false);
  };
  const updateContractToFix = (data) => {
    api
      .editContractToFix(data, data.pk)
      .then((resp) => {
        if (resp.response.ok) {
          setContracts(resp.data);
          toast({
            title: "Dane zaktualizowane.",
            description: "Dane zostały zaktualizowane.",
            status: "success",
            duration: 6000,
            isClosable: true,
          });
          onClose();
          clearValues();
        } else {
          alert(resp.response.status);
        }
      })
      .catch((error) => {
        alert(error);
      });
  };
  const addContractToFix = (data) => {
    setUpdate(false);
    api
      .newContractToFix(data)
      .then((resp) => {
        if (resp.response.ok) {
          setContracts(resp.data);
          toast({
            title: "Dodano.",
            description: "Jest ok.",
            status: "success",
            duration: 6000,
            isClosable: true,
          });
          onClose();
          clearValues();
        } else {
          alert(resp.response.status);
        }
      })
      .catch((error) => {
        alert(error);
      });
  };
  const copyAll = () => {
    let textAll = "";
    console.log(contracts);
    contracts.forEach((element) => {
      let elementText = `${element.name} Nip: ${element.nip} Handlowcy: ${element.salesman} Data podpisania: ${element.date_signed}\nRzeczy do poprawy: ${element.info} \n\n`;
      textAll += elementText;
    });

    let textArea = document.createElement("textarea");
    textArea.value = textAll;
    // make the textarea out of viewport
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((res, rej) => {
      // here the magic happens
      document.execCommand("copy") ? res() : rej();
      textArea.remove();
    });
    // navigator.clipboard.writeText(textAll);
  };
  const exportAll = async () => {
    const fontBytes = await fetch(roboto).then((res) => res.arrayBuffer());
    const doc = await PDFDocument.create();
    doc.registerFontkit(fontkit);
    const robotoFont = await doc.embedFont(fontBytes);

    let page = doc.addPage();
    const { width, height } = page.getSize();
    const x_pad = 10;

    let count = 0;
    let y = 25;
    contracts.forEach((element) => {
      let elementText = `${element.name} Nip: ${element.nip} Handlowcy: ${element.salesman} Data podpisania: ${element.date_signed}\nRzeczy do poprawy: ${element.info} `;

      page.drawText(elementText, {
        x: x_pad,
        y: height - y,
        size: 14,
        font: robotoFont,
        maxWidth: width - x_pad * 2,
      });
      count += 1;
      y += 111;
      if (count >= 7) {
        count = 0;
        y = 25;
        page = doc.addPage();
      }
    });
    const docBytes = await doc.save();
    const blob = new Blob([docBytes]);
    const fileName = `eksport_do_poprawy_${new Date().toISOString()}.pdf`;
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  useEffect(() => {
    register("id", {});
    api
      .getContractsToFix()
      .then((resp) => {
        setContracts(resp.data);
      })
      .catch((error) => {
        alert(error);
      });
  }, []);

  return (
    <>
      <Button
        m={4}
        onClick={() => {
          setUpdate(false);
          clearValues();
          onOpen();
        }}
      >
        Dodaj umowe
      </Button>
      <Button m={4} onClick={copyAll}>
        Kopiuj
      </Button>
      <Button m={4} onClick={exportAll}>
        Eksportuj
      </Button>
      <Heading size="md" m={3}>
        Filtruj umowy
      </Heading>
      <Container>
        <FilterToFix contracts={contracts} setContracts={setContracts} />
      </Container>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Do poprawy</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              mb={2}
              placeholder="Nazwa firmy"
              mr={4}
              {...register("name", {})}
            />
            {errors.name && <AlertPop title={errors.name.message} />}

            <Input
              mb={2}
              placeholder="NIP"
              type="number"
              {...register("nip", {
                required: "Wpisz poprawny NIP",
                minLength: 10,
                maxLength: 10,
              })}
            />
            {errors.nip && <AlertPop title={errors.nip.message} />}

            <Input
              mb={2}
              placeholder="Handlowiec"
              type="text"
              {...register("salesman", {
                required: "Wpisz imię(imiona) i nazwisko/a.",
                minLength: 1,
              })}
            />

            <Text pl={1} fontSize="lg">
              Data podpisania umowy
            </Text>
            <Input mb={2} type="date" {...register("date_signed", {})} />
            <Select
              mb={2}
              placeholder="Oddział"
              {...register("branch", { required: "Wybierz oddział" })}
            >
              <option value="EX">Example</option>
            </Select>
            {errors.branch && <AlertPop title={errors.branch.message} />}
            <Textarea
              mb={2}
              placeholder="Rzeczy do poprawy"
              {...register("info", {
                required: "Wpisz cos",
                minLength: 1,
              })}
            />
            {errors.info && <AlertPop title={errors.info.message} />}
            <Select mb={2} placeholder="Status" {...register("status")}>
              <option value="1">Aneks - Obowiązujący</option>
              <option value="2">Aneks - Przed okresem obowiązywania</option>
              <option value="3">Aneks - Wysłany do klienta</option>
              <option value="4">Anulowana</option>
              <option value="5">Cesja - Do podpisania przez klienta</option>
              <option value="6">Cesja - Pozytywna weryfikacja</option>
              <option value="7">Cesja - Wysłano zgłoszenie do OSD</option>
              <option value="8">Do podpisania przez klienta</option>
              <option value="9">Do poprawy</option>
              <option value="10">Oczekuje na zatwierdzenie</option>
              <option value="11">Rozpoczęto proces ZS</option>
              <option value="12">Rozwiązana</option>
              <option value="13">Wersja - W przygotowaniu</option>
              <option value="14">Weryfikacja negatywna - BZS</option>
              <option value="15">Weryfikacja pozytywna - BZS</option>
              <option value="16">Zakończona</option>
              <option value="17">Zakończono proces ZS</option>
              <option value="18">Brak</option>
            </Select>
            <Input
              mb={2}
              placeholder="Sekretarka wypełniająca umowe"
              type="text"
              {...register("secretary", {})}
            />
          </ModalBody>

          <ModalFooter>
            {update ? (
              <>
                <Button
                  mr={4}
                  colorScheme="red"
                  onClick={handleSubmit(deleteContractToFix)}
                >
                  Usuń
                </Button>
                <Button onClick={handleSubmit(updateContractToFix)}>
                  Aktualizuj
                </Button>
              </>
            ) : (
              <Button onClick={handleSubmit(addContractToFix)}>Dodaj</Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
      {contracts ? (
        <Table m={5}>
          <Thead>
            <Tr>
              <Th>NIP</Th>
              <Th>Nazwa firmy</Th>
              <Th>Handlowiec</Th>
              <Th>Data podpisania</Th>
              <Th>Opis</Th>
              <Th>Edycja</Th>
            </Tr>
          </Thead>
          <Tbody>
            {contracts.map((c) => (
              <Tr key={c.id}>
                <Td>{c.nip}</Td>
                <Td>{c.name}</Td>
                <Td>{c.salesman}</Td>
                <Td>{new Date(c.date_signed).toUTCString()}</Td>
                <Td>{c.info}</Td>
                <Td>
                  {/* TODO hide edit */}
                  <Button onClick={() => editModal(c)}>Edytuj</Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <></>
      )}
    </>
  );
};

export default ToFixPage;
