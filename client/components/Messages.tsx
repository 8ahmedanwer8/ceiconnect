import { useSockets } from "../context/sockets.context";
import { useEffect, useRef } from "react";
import EVENTS from "../config/events";
import { formatAMPM } from "../utils/helpers";
import SendIcon from "../../client/public/send-icon.svg";
import Image from "next/image";
import {
  Box,
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
    <Box position="relative" h="80vh" overflow="scroll">
      <Box bgColor="#171721" px="1em" py="1em" w="100%">
        <Text
          fontFamily="libre"
          color="#EEF0F2"
          fontWeight="semibold"
          textAlign="center"
          fontSize="lg"
        >
          Say something to LusterousGaboon! woohoo
        </Text>
        <Text
          color="#EEF0F2"
          fontWeight="regular"
          textAlign="center"
          fontSize="xs"
        >
          Monday April 12 2023, 9:50 AM
        </Text>
      </Box>
      <Box px="1em">
        {messages.map(({ message, username, time }, index) => {
          console.log(typeof username, typeof `You (${usernameString})`);
          if (username === `You (${usernameString})`) {
            return (
              <Box paddingBottom="1em" flex="1">
                <Text
                  style={{ wordWrap: "break-word" }}
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
                  : {message}
                  <Text
                    as="span"
                    color="#EEF0F2"
                    fontWeight="thin"
                    textAlign="center"
                    fontSize="xs"
                    opacity="0.5"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {" "}
                    {time}
                  </Text>
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
                  : {message}
                  <Text
                    as="span"
                    color="#EEF0F2"
                    fontWeight="thin"
                    textAlign="center"
                    fontSize="xs"
                    opacity="0.5"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {" "}
                    {time}
                  </Text>
                </Text>
                <div ref={messageEndRef}></div>
              </Box>
            );
          }
        })}
      </Box>
      <Box
        height="9vh"
        marginTop="1em"
        position="fixed"
        w="100%"
        paddingLeft="1em"
        left="0"
        bottom="0"
        bg="#201F20"
        display="flex"
        alignItems="center"
      >
        <InputGroup size="md" flexGrow={1}>
          <Input
            bgColor="#D9D9D9"
            ref={newMessageRef}
            placeholder="Type something"
          />
        </InputGroup>

        <Box
          h="2rem"
          w="3rem"
          marginLeft="1em"
          cursor="pointer"
          onClick={handleSendMessage}
        >
          <img
            style={{
              width: "30px",
              height: "30px",
              filter: "invert(0.5) sepia(1) saturate(5) hue-rotate(175deg)",
            }}
            src="https://www.svgrepo.com/show/230979/send.svg"
          />
        </Box>
      </Box>
    </Box>
  );
}
export default Messages;
