import React, { useEffect, useState } from "react";
import {
  Input,
  Button,
  VStack,
  Spinner,
  Heading,
  InputGroup,
  useToast,
  Text,
  InputLeftAddon,
} from "@chakra-ui/react";
import * as XLSX from "xlsx";
import Api from "../utils/apiCalls";

const Concract = () => {
  const [file, setFile] = useState();
  const [stats, setStats] = useState();
  const [loading, setLoading] = useState(false);
  const api = new Api();
  const toast = useToast();

  useEffect(() => {
    api.getStats().then((resp) => {
      setStats(resp.data);
    });
  }, []);

  const handleFileChange = (event) => setFile(event.target.files[0]);

  const success = () =>
    toast({
      title: "Dane zaktualizowane.",
      description: "Dane zostały zaktualizowane.",
      status: "success",
      duration: 6000,
      isClosable: true,
    });

  const addContractsFile = () => {
    setLoading(true);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: "binary" });
      workbook.SheetNames.forEach(function (sheetName) {
        // rename columns
        workbook.Sheets[sheetName].B1.w = "name";
        workbook.Sheets[sheetName].C1.w = "nip";
        workbook.Sheets[sheetName].E1.w = "contract_number";
        workbook.Sheets[sheetName].F1.w = "status";
        workbook.Sheets[sheetName].N1.w = "date_begin";
        workbook.Sheets[sheetName].O1.w = "date_end";
        workbook.Sheets[sheetName].J1.w = "volume";

        //do delete
        workbook.Sheets[sheetName].A1.w = "A";
        workbook.Sheets[sheetName].D1.w = "D";
        workbook.Sheets[sheetName].G1.w = "G";
        workbook.Sheets[sheetName].H1.w = "H";
        workbook.Sheets[sheetName].I1.w = "I";
        workbook.Sheets[sheetName].K1.w = "K";
        workbook.Sheets[sheetName].L1.w = "L";
        workbook.Sheets[sheetName].M1.w = "M";
        workbook.Sheets[sheetName].P1.w = "P";
        workbook.Sheets[sheetName].Q1.w = "Q";

        let XL_row_object = XLSX.utils.sheet_to_row_object_array(
          workbook.Sheets[sheetName]
        );
        XL_row_object = XL_row_object.map(
          ({ A, D, G, H, I, K, L, M, P, Q, ...keepAttrs }) => keepAttrs
        );

        api
          .newContracts(XL_row_object)
          .then((resp) => {
            if (resp.response.ok) {
              success();
            } else {
              alert("Error " + resp.response.status);
            }
          })
          .catch((error) => {
            setLoading(false);
            if (`${error}`.includes("SyntaxError")) {
              success();
            } else {
              alert(error);
            }
          })
          .finally(() => {
            setLoading(false);
          });
      });
    };
  };
  const addPPEFile = () => {
    setLoading(true);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: "binary" });
      workbook.SheetNames.forEach(function (sheetName) {
        // console.log(workbook.Sheets[sheetName]);
        workbook.Sheets[sheetName].J2.w = "ppe_number";
        workbook.Sheets[sheetName].F2.w = "contract_number";

        let XL_row_object = XLSX.utils.sheet_to_row_object_array(
          workbook.Sheets[sheetName]
        );
        console.log(XL_row_object);
        XL_row_object = XL_row_object.map(
          ({ __EMPTY_5, __EMPTY_9, ...otherAttrs }) =>
            Object({
              ppe_number: __EMPTY_9,
              contract_number: __EMPTY_5,
            })
        );
        // TODO FIX IT !!!!!!!!

        console.log(XL_row_object);
        api
          .addPPEs(XL_row_object)
          .then((resp) => {
            if (resp.response.ok) {
              success();
            } else {
              alert("Error " + resp.response.status);
            }
          })
          .catch((error) => {
            setLoading(false);
            if (`${error}`.includes("SyntaxError")) {
              success();
            } else {
              alert(error);
            }
          })
          .finally(() => {
            setLoading(false);
          });
      });
    };
  };

  return (
    <VStack mt={8}>
      <VStack>
        <Heading fontSize="3xl" color="brand.primary">
          Dodaj umowy
        </Heading>
        <InputGroup>
          <InputLeftAddon children="Plik Z CRM" />
          <Input
            onChange={handleFileChange}
            variant="filled"
            type="file"
            name="contracts"
          ></Input>
          {loading ? (
            <Spinner ml={3} mt={2} />
          ) : (
            <Button ml="1em" onClick={addContractsFile}>
              Dodaj
            </Button>
          )}
        </InputGroup>
      </VStack>

      <VStack>
        <Heading mt={10} fontSize="3xl" color="brand.primary">
          Dodaj numery PPE
        </Heading>
        <InputGroup>
          <InputLeftAddon children="Rozliczenia" />
          <Input
            onChange={handleFileChange}
            variant="filled"
            type="file"
            name="ppe"
          ></Input>
          {loading ? (
            <Spinner ml={3} mt={2} />
          ) : (
            <Button ml="1em" onClick={addPPEFile}>
              Dodaj
            </Button>
          )}
        </InputGroup>
      </VStack>
      <div>
        {stats ? (
          <>
            <Text key="hhh" fontSize="lg">
              Statystyki braku danych
            </Text>
            <Text key="ppe">
              nr PPE: {stats.ppe}
              <br />
              Handlowiec: {stats.salesman}
              <br />
              Data konca umowy: {stats.date_end}
              <br />
              Nr telefonu: {stats.phone_number}
              <br />
              Adres: {stats.address}
              <br />
            </Text>
          </>
        ) : (
          <></>
        )}
      </div>
    </VStack>
  );
};
export default Concract;
