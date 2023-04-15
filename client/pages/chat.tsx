import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import { useSockets } from "../context/sockets.context";
const inter = Inter({ subsets: ["latin"] });
import EVENTS from "../config/events";
import Messages from "../components/Messages";
import Router from "next/router";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import {
  Box,
  theme,
  Heading,
  Text,
  Stack,
  Flex,
  Image,
} from "@chakra-ui/react";
export default function Chat() {
  const { socket, rooms, username, otherUsername, roomId } = useSockets();
  const [loadingText, setLoadingText] = useState("I am loading text");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  useEffect(() => {
    socket.emit(EVENTS.CLIENT.MY_USERNAME, {
      roomId: roomId,
      username: username.current,
    });
  }, [roomId]);

  if (!roomId) {
    //no client side validation i think which is bad which i need
    return (
      <div>
        <p>You are not in a chat with someone right now</p>
        <p>Join someone here</p>
        <button>
          <Link href="/find">Jump in a chat now</Link>
        </button>
      </div>
    );
  }
  return (
    <Box minH="100vh" maxW="full" bgColor="#171A21">
      <Box h="fit-content" w="100%" bgColor="#0A1A3C" p="1em">
        <Heading color="#F0F443" as="h1" fontWeight="semibold" fontSize="3xl">
          CeiConnect
        </Heading>
      </Box>
      <Box maxW="full" px="1em" py="1em">
        <Box bgColor="#171721" w="100%" h="100%">
          <Messages></Messages>
        </Box>
      </Box>

      {/* <Box>{roomId}</Box> */}
      {/* <Text>You are chatting with {otherUsername.current}</Text> */}
    </Box>
  );
}
