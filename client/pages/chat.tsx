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

  function disconnectUser() {
    //send message to server saying disconnect
    //server receives the message and removes user from room
    //sends response back here saying that disconnection has been done
    //orrr there was an error
    //tell other user that their friend left
    console.log("trying to disconnect");
    if (roomId) {
      socket.emit(EVENTS.CLIENT.DISCONNECT, {
        roomId: roomId,
        username: username,
      });
    }
  }

  function disconnectUser2(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      console.log("trying to disconnect");
      let timeoutId;

      const disconnectTimeout = 5000; // Timeout duration in milliseconds

      const handleDisconnectResponse = () => {
        clearTimeout(timeoutId);
        resolve(); // Disconnection successful
      };

      const handleTimeout = () => {
        socket.off(EVENTS.SERVER.DISCONNECTED, handleDisconnectResponse);
        reject(new Error("Disconnection timeout")); // Disconnection unsuccessful
      };

      if (roomId) {
        socket.emit(EVENTS.CLIENT.DISCONNECT, {
          roomId: roomId,
          username: username,
        });

        timeoutId = setTimeout(handleTimeout, disconnectTimeout);

        socket.once(EVENTS.SERVER.DISCONNECTED, handleDisconnectResponse);
      } else {
        resolve(); // No roomId, consider disconnection successful
      }
    });
  }

  //show warning dialog when user reloads page
  // useEffect(() => {
  //   const handleBeforeUnload = (event) => {
  //     // Perform any necessary cleanup or execute the desired function here
  //     // For example, you can log out the user
  //     handleDisconnect();

  //     // Custom message for Chrome
  //     event.preventDefault();
  //     event.returnValue = "";

  //     // Custom message for Firefox
  //     return "";
  //   };

  //   const handleUnload = () => {
  //     // Perform any necessary cleanup or execute the desired function here
  //     // For example, you can log out the user
  //     handleDisconnect();
  //   };

  //   window.addEventListener("beforeunload", handleBeforeUnload);
  //   window.addEventListener("unload", handleUnload);

  //   return () => {
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //     window.removeEventListener("unload", handleUnload);
  //   };
  // }, []);

  function handleDisconnect() {
    // TODO for reloading page, closing tab or window, or clciking or back button or clicking on home page
    console.log("disconnecting user");
    disconnectUser2();
    router.push({
      pathname: "/",
    });
  }
  async function handleDisconnect2() {
    console.log("disconnecting user");
    setLoading(true);
    try {
      setLoading(true);
      await disconnectUser2();
      router.push({
        pathname: "/",
      });
    } catch (error) {
      alert(error);
      console.error("Error during disconnection:", error);
    }
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
                <Button colorScheme="red" onClick={handleDisconnect2}>
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
