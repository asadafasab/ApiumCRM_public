import React from "react";
import {
  Link,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";

const Details = (contract) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  contract = contract.contract;

  return (
    <>
      <Link ml={3} onClick={onOpen}>
        Szczegóły
      </Link>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Szczegóły</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {contract ? (
              <>
                Nazwa firmy: {contract.name}
                <br />
                NIP: {contract.nip}
                <br />
                Numer umowy: {contract.contract_number}
                <br />
                <br />
                Oddział: {contract.branch}
                <br />
                Cena: {contract.price}
                <br />
                {/* {contract.price.split("Produkt:").map(el => (
                                <p key={el}>{el}</p>
                            ))}<br /> */}
                Data podpisania umowy: {contract.date_signed}
                <br />
                Data obowiązywania od: {contract.date_begin}
                <br />
                Data obowiązywania do: {contract.date_end}
                <br />
                Handlowiec: {contract.salesman}
                <br />
                Status: {contract.status}
                <br />
                Wolumen: {contract.volume} MWh
                <br />
                Address: {contract.address}
                <br />
                Nr telefonu: {contract.phone_number}
                <br />
                Właściciel: {contract.owner}
                <br />
                Osoba kontaktowa: {contract.contact_person}
                <br />
                Medium: {contract.medium}
                <br />
                Dodatkowe informacje: {contract.info}
                <br />
              </>
            ) : (
              <>Ładowanie</>
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Zamknij
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Details;
