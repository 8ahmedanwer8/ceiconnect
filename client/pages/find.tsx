import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import { useSockets } from "../context/sockets.context";
const inter = Inter({ subsets: ["latin"] });
import EVENTS from "../config/events";
import Messages from "../components/Messages";
import { useRouter } from "next/router";
import load from "./load.svg";

import {
  Box,
  Text,
  Heading,
  Container,
  Center,
  Spinner,
  HStack,
  Stack,
  Wrap,
  VStack,
  ButtonGroup,
  Button,
} from "@chakra-ui/react";

import { useState, useEffect } from "react";

/* 
  right now the connection works like this

  u click find a room
  then NEW_WAITING -> JOINED_WAITING_ROOM 
  if waiting room has no one, wait until we get CONNECTEDWITHYOU 
  -> waiting means a second person will join and they will see waiting room has another person
  -> and they will hit the else block on their side and connect with you using the CONNECT_ME msg
  else CONNECT_ME->	CONNECTED
  router.push to /chat/roomId

  so if i join the waiting room, i first get joinedwaitingroom message with the 
  number of waiting room members. if it is just me, then i wait for a socket.on connectedwithyou
  else: there are other members as well so client sends a connectme message
  to server and server connects me to the other person in the waiting room by sending them a connected with you
  and sending ME a joined room message
*/

/*
  I am using "type" to refer to the tuple that represents the preferences of a user
  The X in (IS: X, WANTS X) means any preference including no preference.

  - (IS: NO_PREF, WANTS: NO_PREF) and (IS: NO_PREF, WANTS: NO_PREF) then they match
  first priority (random pool selection of their types).

  - (IS: A, WANTS: NO_PREF) then they match with (IS: NO_PREF, WANTS: A) first priority
  and (IS: X, WANTS: A) second priority and (IS: NO_PREF, WANTS: NO_PREF) third priority.

  - (IS: NO_PREF, WANTS: A) then they match with (IS: A, WANTS: NO_PREF) first priority
  and (IS: X, WANTS: NO_PREF) second priority and (IS: NO_PREF, WANTS: NO_PREF) third

  - (IS: A, WANTS: A) then they match with (IS: A, WANTS: A) first priority
  and (IS: X, WANTS: A) second priority and (IS: NO_PREF, WANTS: NO_PREF) third

  - (IS: A, WANTS: B) then they match first priority with (IS: B, WANTS: A) and
  (IS: X, WANTS: A) second, (IS: NO_PREF, WANTS: NO_PREF) third.

  first priority (random pool selection of their types).
  - (IS: NO_PREF, WANTS: NO_PREF) and (IS: NO_PREF, WANTS: NO_PREF) then they match
  - (IS: A, WANTS: B) and (IS: B, WANTS: A) then they match
  - (IS: A, WANTS: B) and (IS: A, WANTS: C) wait until for a match to be found
  otherwise match them up together or with someone lik
  
  so basically idea is u match with someone that u want and they want u,
  else, they want u but u may not want them
  else u get matched with no prefs

  a,b E
  c,d 
  isnt fair to pair a and c
  eventually they end up in status D. new person joins

  - weshould ADD A 4TH STATUS for basically types that dont
  match with anything like a,b and c,d and there are none no prefs around
  so you just gotta mix and match ppl

*/

export default function Find() {
  const { socket, rooms, username, roomId } = useSockets();
  const [loadingText, setLoadingText] = useState("Loading text");
  const [tipText, setTipText] = useState("I am loading text");

  const [finding, setFinding] = useState(false);

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const options = ["No preference", "STEM", "Humanities", "Business", "Other"];

  const [selectOwnPref, setSelectOwnPref] = useState("No preference");
  const [selectPref, setSelectPref] = useState("No preference");

  const handleOwnPref = (option) => {
    setSelectOwnPref(option);
  };

  const handleSelectPref = (option) => {
    setSelectPref(option);
  };
  const preferences = {
    IS: selectOwnPref,
    WANTS: selectPref,
  };
  useEffect(() => {
    //this is part of the find logic. it is in useEffect because otherwise
    //if it is in the find function, the event listeners end up getting
    //doubled or something which sends to many emits to the server

    socket.on(EVENTS.SERVER.JOINED_WAITING_ROOM, (otherWaitingUsers) => {
      console.log("sent a EVENTS.CLIENT.CONNECT_ME");

      // setLoadingText(`Found ${otherWaitingUsers.length} online`);
      if (otherWaitingUsers.length <= 1) {
        //theres nobody else besides this user on the app
        //add retry and waiting logic
        setLoadingText("Searching for someone");

        socket.on(EVENTS.SERVER.CONNECTEDWITHYOU, (roomkey) => {
          setLoadingText("Found someone!");
          setLoadingText("Joining room");
          setFinding(false);
          setLoading(false);
          socket.off(EVENTS.SERVER.JOINED_WAITING_ROOM);

          //go to chat page
          router.push({
            pathname: "/chat",
          });
        });
      } else {
        setLoadingText("Found someone!");
        console.log("sent a EVENTS.CLIENT.CONNECT_ME");
        socket.emit(EVENTS.CLIENT.CONNECT_ME, preferences);
        setLoadingText("Trying to connect with them");
        socket.off(EVENTS.SERVER.JOINED_WAITING_ROOM);

        socket.on(EVENTS.SERVER.CONNECTED, (roomkey) => {
          setLoadingText("Joining room");
          setFinding(false);
          setLoading(false);
          //go to chat page
          router.push({
            pathname: "/chat",
          });
        });
      }
    });
  }, [socket]);
  function findSomeone() {
    setFinding(true);
    setLoading(true);
    console.log("requesting to connect");

    socket.emit(EVENTS.CLIENT.NEW_WAITING, preferences);
  }

  useEffect(() => {
    // const nickname = generateRandomUsername();
    // username.current = nickname;
    // console.log(username);
    setLoadingText("Connected to Servers");
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
    >
      {finding ? (
        <Box
          bgColor="#171A21"
          // justifyContent="center"
          alignSelf="center"
          w="80vw"
          h="50vh"
        >
          <VStack>
            <Text
              mt="4"
              mb="8"
              fontFamily="roboto"
              fontSize="xl"
              color="#FFFFFF"
            >
              {loadingText}
            </Text>
            <Spinner mb="4" boxSize={28} color="white"></Spinner>
            <Text fontFamily="roboto" fontWeight="light" color="#FFF">
              {tipText}
            </Text>
          </VStack>
        </Box>
      ) : (
        <Box
          bgColor="#171A21"
          justifyContent="center"
          alignSelf="center"
          w={{ base: "70vw", md: "50vw", lg: "30vw" }}
          h="fit-content"
        >
          <VStack mt="4" width="100%" textAlign="center">
            <Box
              textAlign="center"
              justifyContent="center"
              justifyItems="center"
              w="100%"
            >
              <Text
                fontFamily="roboto"
                fontWeight="semibold"
                fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                color="#FFF"
              >
                I am in
              </Text>

              <Box px="6" mt="4" mb="8" w="100%">
                <Wrap alignItems="center" spacing="4">
                  {options.map((option) => (
                    <Button
                      key={option}
                      w="fit-content"
                      size={{ base: "sm", md: "md", lg: "lg" }}
                      fontSize={{ base: "s", md: "md", lg: "lg" }}
                      fontFamily="roboto"
                      fontWeight="600"
                      // colorScheme="twitter"
                      _hover={option !== selectOwnPref && { bg: "#1da1f9" }}
                      color="white"
                      opacity={selectOwnPref === option ? "1" : "0.6"}
                      bg={
                        selectOwnPref === option
                          ? "#00488A"
                          : "rgba(67, 187, 244, 0.80)"
                      }
                      _active={{ opacity: 0.3 }}
                      onClick={() => handleOwnPref(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </Wrap>
              </Box>
            </Box>
            <Box
              textAlign="center"
              justifyContent="center"
              justifyItems="center"
              w="100%"
            >
              <Text
                fontFamily="roboto"
                fontWeight="semibold"
                fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                color="#FFF"
              >
                I want
              </Text>

              <Box px="6" mt="4" mb="8" w="100%">
                <Wrap alignItems="center" spacing="4">
                  {options.map((option) => (
                    <Button
                      key={option}
                      w="fit-content"
                      size={{ base: "sm", md: "md", lg: "lg" }}
                      fontSize={{ base: "s", md: "md", lg: "lg" }}
                      fontFamily="roboto"
                      fontWeight="600"
                      _hover={option !== selectPref && { bg: "#1da1f9" }}
                      color="white"
                      opacity={selectPref === option ? "1" : "0.6"}
                      bg={
                        selectPref === option
                          ? "#00488A"
                          : "rgba(67, 187, 244, 0.80)"
                      }
                      _active={{ opacity: 0.3 }}
                      onClick={() => handleSelectPref(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </Wrap>
                <ButtonGroup mt="8">
                  <Button
                    w="fit-content"
                    size="md"
                    fontSize="20px"
                    as="i"
                    fontFamily="inter"
                    cursor="pointer"
                    fontWeight="extrabold"
                    bgGradient="linear(to-l, #F0F443, #FBD26A)"
                    _hover={{ bgGradient: "linear(to-l, #FBD26A, #F0F443)" }}
                    _active={{ bgGradient: "linear(to-l, #F0F443, #FBD26A)" }}
                    onClick={() => {
                      findSomeone();
                    }}
                  >
                    SEARCH
                  </Button>
                </ButtonGroup>
              </Box>
            </Box>
          </VStack>
        </Box>
      )}
    </Container>
  );
}
