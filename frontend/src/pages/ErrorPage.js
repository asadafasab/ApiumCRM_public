import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Text,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import Api from "../utils/apiCalls";

const ErrorPage = () => {
  const [error, setError] = useState([]);
  const api = new Api();

  useEffect(() => {
    api.getError().then((resp) => {
      setError(JSON.parse(resp.data.message));
    });
  }, []);

  return (
    <Card>
      <CardHeader>
        <Text fontSize="2xl">
          Lista rzeczy do sprawdzenia w pliku z GooglDrive
        </Text>
      </CardHeader>
      <CardBody>
        <div>
          {error.map((element) => (
            <>
              {element.errors.includes("code='unique'") ? (
                <></>
              ) : (
                <Text key={element.id}>
                  {element.errors} - {element.contract}
                  <br />
                  <br />
                  <br />
                </Text>
              )}
            </>
          ))}
        </div>

        <Accordion>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box as="span" flex="1" textAlign="left">
                  Nieunikatowe umowy
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pt={10} pb={4}>
              {error.map((element) => (
                <>
                  {element.errors.includes("code='unique'") ? (
                    <Text key={element.id}>
                      {element.errors} - {element.contract}
                      <br />
                      <br />
                      <br />
                    </Text>
                  ) : (
                    <></>
                  )}
                </>
              ))}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </CardBody>
    </Card>
  );
};
export default ErrorPage;
