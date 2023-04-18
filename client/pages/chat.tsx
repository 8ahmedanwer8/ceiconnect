import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import { useSockets } from "../context/sockets.context";
const inter = Inter({ subsets: ["latin"] });
import EVENTS from "../config/events";
import Messages from "../components/Messages";
import Router from "next/router";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect, useDisc } from "react";
import {
  Box,
  Heading,
  Modal,
  Text,
  Button,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  VStack,
  Spacer,
  Spinner,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";

export default function Chat() {
  const { socket, rooms, username, otherUsername, roomId } = useSockets();
  const [loadingText, setLoadingText] = useState("I am loading text");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  useEffect(() => {
    router.beforePopState(({ as }) => {
      if (as !== router.asPath) {
        onOpen();
      }
    });

    return () => {
      router.beforePopState(() => true);
    };
  }, [router]);

  function handleDisconnect() {
    router.push({
      pathname: "/",
    });
  }

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
        <Heading
          onClick={onOpen}
          color="#F0F443"
          as="h1"
          fontWeight="semibold"
          fontSize="3xl"
          cursor="pointer"
        >
          CeiConnect
        </Heading>
      </Box>
      <Box maxW="full" px="1em" py="1em">
        <Box bgColor="#171721" w="100%" h="100%">
          <Messages></Messages>
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent p="4" position="absolute" top="20%" bg="#171A21">
              <ModalCloseButton color="white"></ModalCloseButton>
              <ModalBody>
                <Text fontFamily="roboto" fontSize="lg" color="#FFFFFF">
                  Are you sure you want to leave this chat? Chat history will be
                  lost and maybe your friend too :(
                </Text>
              </ModalBody>

              <ModalFooter>
                <Button colorScheme="red" onClick={handleDisconnect}>
                  Leave chat
                </Button>
                <Spacer />
                <Button colorScheme="blue" mr={3} onClick={onClose}>
                  Go back
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Box>
      </Box>

      {/* <Box>{roomId}</Box> */}
      {/* <Text>You are chatting with {otherUsername.current}</Text> */}
    </Box>
  );
}
