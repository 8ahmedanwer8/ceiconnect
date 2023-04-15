import { useSockets } from "../context/sockets.context";
import { useEffect, useRef } from "react";
import EVENTS from "../config/events";
import { formatAMPM } from "../utils/helpers";
import SendIcon from "../../client/public/send-icon.svg";
import Image from "next/image";
import Router from "next/router";
import {
  Box,
  Container,
  Center,
  VStack,
  UnorderedList,
  ListItem,
  InputGroup,
  InputRightElement,
  Button,
  Heading,
  Text,
  Textarea,
  Input,
  Stack,
  Flex,
} from "@chakra-ui/react";
function LandingSection() {
  return (
    <Container
      // bgImage="url(https://media.giphy.com/media/iI9IY9XXl2eKmDpQMY/giphy.gif)"
      // bgRepeat="no-repeat"
      // bgSize="cover"
      bgColor="#0A1A3C"
      maxW="container.2xl"
    >
      <Center pt={4} px={4} minHeight="85vh">
        <VStack>
          <Container maxW="container.md" textAlign="center">
            <Heading fontWeight="extrabold" size="4xl" mb={4} color="#F0F443">
              CeiConnect
            </Heading>
            <Text
              mt={8}
              color="#EEF0F2"
              fontWeight="medium"
              textAlign="center"
              fontSize="m"
            >
              Chat with other University of Windsor students on campus.
              Anonymously ;
            </Text>

            <UnorderedList
              mt={8}
              color="#EEF0F2"
              fontWeight="medium"
              textAlign="left"
              fontSize="sm"
            >
              <ListItem>Make new epic friends 💙</ListItem>
              <ListItem>Vent about shit maybe 🔥</ListItem>
              <ListItem>Find a study buddy or lunch date 😎</ListItem>
            </UnorderedList>

            <Button
              mt={8}
              borderRadius="1rem"
              h="4em"
              _hover={{
                bgColor: "#6DD9FF",
              }}
              bgColor="#43BBF4"
              onClick={() => {
                Router.push({
                  pathname: "/find",
                });
              }}
            >
              Jump in a chat with someone now!
            </Button>
            <Text
              mt={8}
              color="#EEF0F2"
              fontWeight="light"
              textAlign="center"
              fontSize="m"
            >
              (Not affiliated with the University of Windsor!)
            </Text>
          </Container>
        </VStack>
      </Center>
    </Container>
  );
}
export default LandingSection;
