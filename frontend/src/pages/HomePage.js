import React, { useState, useEffect } from "react";
import {
  Table,
  Thead,
  Text,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  Box,
} from "@chakra-ui/react";
import Details from "../components/Details";
import Api from "../utils/apiCalls";
import FilterContracts from "../components/FilterContracts";

const HomePage = () => {
  const [contracts, setContracts] = useState([]);
  const [sort, setSort] = useState(false);
  const api = new Api();

  const sortDateSigned = () => {
    const contr = contracts.sort((a, b) => {
      const x = new Date(a.date_signed);
      const y = new Date(b.date_signed);
      return sort ? x - y : y - x;
    });
    setContracts(contr);
    setSort(!sort);
  };
  const sortDateBegin = () => {
    const contr = contracts.sort((a, b) => {
      const x = new Date(a.date_begin);
      const y = new Date(b.date_begin);
      return sort ? x - y : y - x;
    });
    setContracts(contr);
    setSort(!sort);
  };
  const sortDateEnd = () => {
    const contr = contracts.sort((a, b) => {
      const x = new Date(a.date_end);
      const y = new Date(b.date_end);
      return sort ? x - y : y - x;
    });
    setContracts(contr);
    setSort(!sort);
  };

  useEffect(() => {
    api.getContracts().then((resp) => {
      setContracts(resp.data);
    });
  }, []);

  return (
    <VStack mt={8}>
      <FilterContracts contracts={contracts} setContracts={setContracts} />
      <Box pt={10}></Box>
      {contracts.length ? (
        <>
          <Table size="sm" variant="striped">
            <Thead>
              <Tr>
                <Th width="5em">Nazwa firmy</Th>
                <Th>NIP</Th>
                <Th>Handlowiec</Th>
                <Th>Numer PPE</Th>
                <Th>Nr umowy</Th>
                <Th _hover={{ cursor: "pointer" }} onClick={sortDateSigned}>
                  Data podpisania
                </Th>
                <Th _hover={{ cursor: "pointer" }} onClick={sortDateBegin}>
                  Wejscie w zycie
                </Th>
                <Th _hover={{ cursor: "pointer" }} onClick={sortDateEnd}>
                  Koniec umowy
                </Th>
                <Th>Operacje</Th>
              </Tr>
            </Thead>
            <Tbody>
              {contracts.map((contract) => (
                <Tr key={contract.id}>
                  <Td>{contract.name}</Td>
                  <Td>{contract.nip}</Td>
                  <Td>{contract.salesman}</Td>
                  <Td>{contract.ppe_number}</Td>
                  <Td>{contract.contract_number}</Td>
                  <Td>{contract.date_signed}</Td>
                  <Td>{contract.date_begin}</Td>
                  <Td>{contract.date_end}</Td>
                  <Td>
                    <Details contract={contract} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>
      ) : (
        <Text fontSize="2xl" mt={9}>
          Brak umów. ༼ つ ◕_◕ ༽つ
        </Text>
      )}
    </VStack>
  );
};
export default HomePage;
