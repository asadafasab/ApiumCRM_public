import React, { useRef, useState } from "react";
import {
  VStack,
  Heading,
  InputLeftAddon,
  InputGroup,
  Spinner,
  Checkbox,
  Tooltip,
  Center,
  Input,
} from "@chakra-ui/react";
import Api from "../utils/apiCalls";

import ExportFile from "../utils/exportPdf";

const FilterContracts = ({ contracts, setContracts }) => {
  const api = new Api();
  const exportpdf = new ExportFile();

  const [search, setSearch] = useState(false);

  const nipRef = useRef(null);
  const annexRef = useRef(null);
  const companyNameRef = useRef(null);
  const contractNumberRef = useRef(null);
  const addressRef = useRef(null);
  const salesmanRef = useRef(null);
  const distanceRef = useRef(null);
  const latRef = useRef(null);
  const lngRef = useRef(null);

  const dateBeginFirstRef = useRef(null);
  const dateBeginSecondRef = useRef(null);
  const dateEndFirstRef = useRef(null);
  const dateEndSecondRef = useRef(null);

  const filterData = () => {
    return {
      nip: nipRef.current.value,
      annex: annexRef.current.checked,
      name: companyNameRef.current.value,
      address: addressRef.current.value,
      salesman: salesmanRef.current.value,
      distance: distanceRef.current.value,
      latitude: latRef.current.value,
      longitude: lngRef.current.value,
      contract_number: contractNumberRef.current.value,
      date_begin_first: dateBeginFirstRef.current.value,
      date_begin_second: dateBeginSecondRef.current.value,
      date_end_first: dateEndFirstRef.current.value,
      date_end_second: dateEndSecondRef.current.value,
    };
  };

  const searchForContracts = () => {
    setSearch(true);

    api
      .getFilteredContracts(filterData())
      .then((resp) => {
        if (resp.response.ok) {
          setContracts(resp.data);
          console.log(resp.data);
        } else {
          alert(resp.response.status);
        }
        setSearch(false);
      })
      .catch((error) => {
        setSearch(false);
        alert(error);
      });
  };

  const exportContracts = () => {
    setSearch(true);

    api
      .getFilteredContracts(filterData())
      .then((resp) => {
        if (resp.response.ok) {
          setContracts(resp.data);
          exportpdf.generate(resp.data);
        } else {
          alert(resp.response.status);
        }
        setSearch(false);
      })
      .catch((error) => {
        setSearch(false);
        alert(error);
      });
  };

  return (
    <>
      <Heading size="lg" mb={3}>
        Filtruj umowy
      </Heading>
      <VStack>
        <InputGroup>
          <Input ref={companyNameRef} placeholder="Nazwa firmy" mr={4} />
          <Input ref={contractNumberRef} placeholder="Nr umowy" />
        </InputGroup>
        <InputGroup>
          <Checkbox mr={4} ref={annexRef}>
            <Tooltip
              label="Filtruj tylko ostatnia umowe na konkretny PPE"
              aria-label="A tooltip"
            >
              Ostatnia umowa
            </Tooltip>
          </Checkbox>
          <Input ref={distanceRef} placeholder="Odległość w km" mr={4} />
          <Input ref={latRef} placeholder="Długość" mr={4} />
          <Input ref={lngRef} placeholder="Szerokosc" />
        </InputGroup>
        <InputGroup>
          <Input ref={nipRef} placeholder="NIP" mr={4} />
          <Input ref={addressRef} placeholder="Adres" mr={4} />
          <Input ref={salesmanRef} placeholder="Handlowiec" />
        </InputGroup>
        <InputGroup>
          <InputLeftAddon children="Data wejscia od" />
          <Input ref={dateBeginFirstRef} mr={4} type="date" />
          <InputLeftAddon children="Data wejscia do" />
          <Input ref={dateBeginSecondRef} type="date" />
        </InputGroup>
        <InputGroup>
          <InputLeftAddon children="Data zakonczenia od" />
          <Input ref={dateEndFirstRef} mr={4} type="date" />
          <InputLeftAddon children="Data zakonczenia do" />
          <Input ref={dateEndSecondRef} type="date" />
        </InputGroup>
        <InputGroup>
          {search ? (
            <InputGroup>
              {/* TODO fix center*/}
              <Center>
                <Spinner size="xl" />
              </Center>
            </InputGroup>
          ) : (
            <>
              <Input
                onClick={exportContracts}
                type="submit"
                value="Eksportuj"
                mr={4}
              />
              <Input
                onClick={searchForContracts}
                type="submit"
                value="Szukaj"
              />
            </>
          )}
        </InputGroup>
      </VStack>
    </>
  );
};

export default FilterContracts;
