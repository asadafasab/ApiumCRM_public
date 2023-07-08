import React, { useState, useEffect } from "react";

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Text,
  useDisclosure,
  Center,
  Button,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import NipModal from "../components/NipModal";
import Api from "../utils/apiCalls";

const ListOfNIPsPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState({});
  const [nips, setNips] = useState([]);
  const api = new Api();

  const updateNipsUi = (data, command) => {
    if (command === "add") {
      setNips([...nips, data]);
    } else if (command === "update") {
      let index = nips.findIndex((obj) => obj.id === data.id);
      let tmp = [...nips];
      tmp[index] = data;
      setNips(tmp);
    } else if (command === "delete") {
      let tmp = [...nips.filter((e) => e.id !== data.id)];
      setNips(tmp);
    }
  };
  const isClose = (date) => {
    const localDate = new Date(date);
    const compareDate = new Date();
    if (localDate.toDateString() === compareDate.toDateString()) {
      return true;
    }
    compareDate.setDate(compareDate.getDate() + 1);
    if (localDate.toDateString() === compareDate.toDateString()) {
      return true;
    }
    return false;
  };
  const editModal = (data) => {
    setCurrent(data);
    onOpen();
  };

  useEffect(() => {
    if (loading) {
      api.getNip().then((resp) => {
        if (resp.data === false) {
          alert("Error");
        }
        setNips(
          resp.data.sort((a, b) => {
            let x = new Date(a.blocade_end);
            let y = new Date(b.blocade_end);
            return x - y;
          })
        );
        setLoading(false);
      });
    } else {
      setNips(
        nips.sort((a, b) => {
          let x = new Date(a.blocade_end);
          let y = new Date(b.blocade_end);
          return x - y;
        })
      );
    }
  }, [nips]);

  return (
    <>
      <Button
        mt={5}
        onClick={() => {
          onOpen();
          setCurrent({});
        }}
      >
        Dodaj nip
      </Button>

      <NipModal
        updateNipsUi={updateNipsUi}
        current={current}
        setCurrent={setCurrent}
        isOpen={isOpen}
        onClose={onClose}
      />
      {nips.length ? (
        <>
          <Heading>NIPy do zablokowania</Heading>
          <Table m={5}>
            <Thead>
              <Tr>
                <Th>NIP</Th>
                <Th>Nazwa firmy</Th>
                <Th>Ofertowany przez</Th>
                <Th>Do kiedy zablokowane</Th>
                <Th>Operacje</Th>
              </Tr>
            </Thead>
            <Tbody>
              {nips
                .filter((n) => n.takeover)
                .map((n) => (
                  <Tr color={isClose(n.blocade_end) ? "red" : ""} key={n.id}>
                    <Td>{n.nip}</Td>
                    <Td>{n.company_name}</Td>
                    <Td>{n.client_of}</Td>
                    {n.blocade_end.includes("3000") ? (
                      <Td></Td>
                    ) : (
                      <Td>{new Date(n.blocade_end).toUTCString()}</Td>
                    )}
                    <Td>
                      <Button onClick={() => editModal(n)}>Edytuj</Button>
                    </Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
          <Heading mt={4}>Zablokowane NIPy</Heading>
          <Table m={5}>
            <Thead>
              <Tr>
                <Th>NIP</Th>
                <Th>Ofertowany przez</Th>
                <Th>Do kiedy zablokowane</Th>
              </Tr>
            </Thead>
            <Tbody>
              {nips
                .filter((n) => !n.takeover)
                .map((n) => (
                  <Tr color={isClose(n.blocade_end) ? "red" : ""} key={n.id}>
                    <Td>{n.nip}</Td>
                    <Td>{n.client_of}</Td>
                    {n.blocade_end.includes("3000") ? (
                      <Td></Td>
                    ) : (
                      <Td>{new Date(n.blocade_end).toUTCString()}</Td>
                    )}
                    <Td>
                      <Button onClick={() => editModal(n)}>Edytuj</Button>
                    </Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
          <Accordion>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as="span" flex="1" textAlign="left">
                    Wszyskie NIPy
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                {nips.map((n) => (
                  <p key={n.id}>
                    {n.company_name} {n.nip} Zablokowane do: {n.blocade_end}{" "}
                    Ofertowany przez: {n.client_of}
                    {n.takeover ? (
                      <></>
                    ) : (
                      <>Zablokowane przez: {n.blocked_by}</>
                    )}
                  </p>
                ))}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </>
      ) : (
        <Center>
          <Text fontSize="2xl" mb={9}>
            Nic ʕ•ᴥ•ʔ
          </Text>
        </Center>
      )}
    </>
  );
};
export default ListOfNIPsPage;
