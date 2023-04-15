import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import { useSockets } from "../context/sockets.context";
const inter = Inter({ subsets: ["latin"] });
import EVENTS from "../config/events";
import Messages from "../components/Messages";
import Router from "next/router";
import load from "./load.svg";

import {
  Box,
  Text,
  Heading,
  Container,
  Center,
  Spinner,
  VStack,
} from "@chakra-ui/react";

import { useState, useEffect } from "react";

export default function Find() {
  const { socket, rooms, username, roomId } = useSockets();
  const [loadingText, setLoadingText] = useState("I am loading text");
  const [tipText, setTipText] = useState("I am loading text");

  const [loading, setLoading] = useState(false);

  function findSomeone() {
    setLoading(true);
    const preferences = {
      IS: "Engineering",
      WANTS: "Nursing",
    };
    socket.emit(EVENTS.CLIENT.NEW_WAITING, {
      username: username,
      preferences,
    });

    socket.on(EVENTS.SERVER.JOINED_WAITING_ROOM, (otherWaitingUsers) => {
      setLoadingText(`Found ${otherWaitingUsers.length} online`);

      if (otherWaitingUsers.length <= 1) {
        //theres nobody else besides this user on the app
        //add retry and waiting logic
        setLoadingText("Looking for someone");

        // const interval = setInterval(() => {
        //   setLoadingText("Looking for someone");

        socket.on(EVENTS.SERVER.CONNECTEDWITHYOU, (roomkey) => {
          setLoadingText("Found someone!");

          setLoadingText("Joining room");

          //go to chat page
          Router.push({
            pathname: "/chat",
            query: { roomId: `${roomkey}` },
          });
        });
        // }, 5000);

        // return () => clearInterval(interval);
      } else {
        setLoadingText("Found someone!");
        socket.emit(EVENTS.CLIENT.CONNECT_ME, username);
        setLoadingText("Trying to connect with them");
        socket.on(EVENTS.SERVER.CONNECTED, (roomkey) => {
          setLoadingText("Joining room");

          //go to chat page
          Router.push({
            pathname: "/chat",
            query: { roomId: `${roomkey}` },
          });
        });
      }
    });
  }

  useEffect(() => {
    // const nickname = generateRandomUsername();
    // username.current = nickname;
    // console.log(username);
    setLoadingText("Connected to Servers");

    findSomeone();
  }, [username]);

  return (
    <Container
      // bgImage="url(https://media.giphy.com/media/iI9IY9XXl2eKmDpQMY/giphy.gif)"
      // bgRepeat="no-repeat"
      // bgSize="cover"
      bgColor="#0B1A3C"
      minHeight="100vh"
      maxW="container.2xl"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      {/*use different dimensions of loading screen for larger screens. maybe not too big. follow figma */}
      <Box bgColor="#171A21" w="80vw" h="50vh">
        <VStack>
          <Text mt="4" mb="8" fontFamily="roboto" fontSize="xl" color="#FFFFFF">
            {loadingText}
          </Text>
          <Spinner boxSize={24} color="white"></Spinner>
          <Text>{tipText}</Text>
        </VStack>
      </Box>
    </Container>
  );
}
