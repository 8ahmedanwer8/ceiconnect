import { useSockets } from "../context/sockets.context";
import { useEffect, useRef } from "react";
import EVENTS from "../config/events";
import { formatAMPM } from "../utils/helpers";

import {
  Box,
  theme,
  Heading,
  Text,
  Input,
  Stack,
  Flex,
  Image,
} from "@chakra-ui/react";
function Messages() {
  const { socket, messages, roomId, username, setMessages } = useSockets();
  const usernameString = username.current; //crappy solution to the problem where i wanna make randomgen username part of the context but i need to use useRef bc using useState and initialzing it causes nextjs to render two different versions of the username during the prerender and the real render since it is a random username each time. so i use a useRef instead to avoid having to use useState. i also cant just intitialize useState inside of useEffect cuz that will be infinite loop i think
  const newMessageRef = useRef(null);
  const messageEndRef = useRef(null);

  function handleSendMessage() {
    const message = newMessageRef.current.value;
    if (!String(message).trim()) {
      return;
    }
    socket.emit(EVENTS.CLIENT.SEND_ROOM_MESSAGE, {
      roomId,
      message,
      usernameString,
    });

    const date = new Date();

    //apparently here we are doing a "lite" version of how messaging is probably
    //supposed to be done. like, i think you're supposed to broadcast an event or
    //something and that will also allow you to have an ID associated with each message
    //but here theres no idea and no event broadcasting or something
    setMessages([
      ...messages,
      {
        username: `You (${usernameString})`,
        message,
        time: `${formatAMPM(date)}`,
      },
    ]);
    newMessageRef.current.value = "";
  }

  useEffect(() => {
    //when new message comes, it scrolls smoothly to it
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!roomId) {
    return <div />;
  }

  return (
    <Box mx="0.5em" position="relative" h="500px" my="1em" overflow="scroll">
      {messages.map(({ message, username, time }, index) => {
        console.log(typeof username, typeof `You (${usernameString})`);
        if (username === `You (${usernameString})`) {
          return (
            <Box paddingBottom="1em" flex="1">
              <Text
                fontFamily="inter"
                fontSize="sm"
                color="#FFFFFF"
                key={index}
              >
                <Text
                  as="span"
                  fontFamily="inter"
                  fontSize="sm"
                  color="#B4AAF1"
                  key={index}
                >
                  {username}
                </Text>
                : {message} {time}
              </Text>
              <div ref={messageEndRef}></div>
            </Box>
          );
        } else {
          return (
            <Box paddingBottom="1em" flex="1">
              <Text
                fontFamily="inter"
                fontSize="sm"
                color="#FFFFFF"
                key={index}
              >
                <Text
                  as="span"
                  fontFamily="inter"
                  fontSize="sm"
                  color="#F0F1AA"
                  key={index}
                >
                  {username}
                </Text>
                : {message} {time}
              </Text>
              <div ref={messageEndRef}></div>
            </Box>
          );
        }
      })}
      <Box
        height="50px"
        position="absolute"
        bottom="0"
        w="100%"
        p="1em"
        bg="#2E2E2E"
      >
        {/* <Input placeholder="Type something" /> */}
        <textarea
          rows={1}
          placeholder="tell us what u are thinking"
          //testing
          ref={newMessageRef}
        />
        <button onClick={handleSendMessage}>SEND</button>
      </Box>
    </Box>
  );
}
export default Messages;
