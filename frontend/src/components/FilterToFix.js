import React, { useRef, useState } from "react";
import {
  VStack,
  InputGroup,
  Spinner,
  Select,
  Center,
  Input,
} from "@chakra-ui/react";
import Api from "../utils/apiCalls";

import ExportFile from "../utils/exportPdf";

const FilterToFix = ({ contracts, setContracts }) => {
  const api = new Api();
  const exportpdf = new ExportFile();

  const [search, setSearch] = useState(false);

  const branchRef = useRef(null);
  const salesmanRef = useRef(null);

  const filterData = () => {
    return {
      branch: branchRef.current.value,
      salesman: salesmanRef.current.value,
    };
  };

  const searchForContracts = () => {
    setSearch(true);

    api
      .getFilteredToFix(filterData())
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

  return (
    <>
      <VStack>
        <InputGroup>
          <Select mr={4} ref={branchRef} placeholder="Oddział">
            <option value="KA">Katowice</option>
            <option value="LO">Łódź</option>
            <option value="PO">Poznań</option>
            <option value="BY">Bydgoszcz</option>
            <option value="SZ">Szczecin</option>
            <option value="GD">Gdynia</option>
            <option value="WR">Wrocław</option>
            <option value="LU">Lublin</option>
          </Select>
          <Input ref={salesmanRef} placeholder="Handlowiec" />
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

export default FilterToFix;
