import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import { useSockets } from "../context/sockets.context";
import Link from "next/link";
const inter = Inter({ subsets: ["latin"] });

import Rooms from "../components/Rooms";
import Messages from "../components/Messages";
import { useRef } from "react";
import Router from "next/router";

import {
  Button,
  Box,
  UnorderedList,
  ListItem,
  Center,
  Container,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
export default function Home() {
  const { socket, username, setUsername } = useSockets();
  const usernameRef = useRef(null);

  function handleSetUsername() {
    const value = usernameRef.current.value;
    if (!value) {
      return;
    }
    setUsername(value);
    localStorage.setItem("username", value);
  }

  return (
    // <div>
    //   {!username && ( //ignoring classnames for divs bc i dont wanna style much
    //     <div>
    //       <input placeholder="Username" ref={usernameRef} />
    //       <button onClick={handleSetUsername}>START</button>
    //     </div>
    //   )}
    //   {username && (
    //     <div>
    //       <Rooms></Rooms>
    //       <Messages></Messages>
    //     </div>
    //   )}
    // </div>
    <Container
      // bgImage="url(https://media.giphy.com/media/iI9IY9XXl2eKmDpQMY/giphy.gif)"
      // bgRepeat="no-repeat"
      // bgSize="cover"
      bgColor="#0A1A3C"
      maxW="container.2xl"
    >
      <Center pt={4} p={4} minHeight="85vh">
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
              Anonymously ;)
            </Text>
            <Text
              color="#EEF0F2"
              fontWeight="medium"
              textAlign="center"
              fontSize="m"
            >
              (Not affiliated with the University!)
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
          </Container>
        </VStack>
      </Center>
    </Container>
  );
}
