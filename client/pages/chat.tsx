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
  Container,
  Center,
  VStack,
  Spacer,
  Spinner,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { join } from "path";

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

  useEffect(() => {
    if (!roomId) {
      router.push("/");
    }
  }, []);
  async function checkCanJoinRoom() {
    const canJoin = await canJoinRoom(roomId);
    return canJoin;
  }
  useEffect(() => {
    socket.on(EVENTS.SERVER.REQUEST_JOIN_RESPONSE, (value) => {
      if (!value) {
        console.log("unverified");
        router.push("/not_found");
      }
    });
  }, [socket]);

  useEffect(() => {
    socket.emit(EVENTS.CLIENT.MY_USERNAME, {
      roomId: roomId,
      username: username.current,
    });
    if (roomId) {
      socket.emit(EVENTS.CLIENT.REQUEST_JOIN, roomId);
    }

    // checkCanJoinRoom().then((canJoin) => {
    //   if (!canJoin) {
    //     // Render the appropriate message or redirect to the join page
    //     console.log("you aren ot allowed");
    //   }
    // });
  }, [roomId]);

  // //show warning dialog when user reloads page or closes it
  // useEffect(() => {
  //   //this does not work for some reason yet. the disconnection message isn't received in the backend
  //   const handleUnload = () => {
  //     // Perform any necessary cleanup or execute the desired function here
  //     // For example, you can log out the user
  //     handleDisconnect2();
  //   };

  //   // window.addEventListener("beforeunload", handleBeforeUnload);
  //   window.addEventListener("unload", handleUnload);

  //   return () => {
  //     // window.removeEventListener("beforeunload", handleBeforeUnload);
  //     window.removeEventListener("unload", handleUnload);
  //   };
  // }, []);

  const unsavedChanges = true;
  const warningText =
    "You have unsaved changes - are you sure you wish to leave this page?";

  // useEffect(() => {
  //   if (roomId) {
  //     const handleWindowClose = (e) => {
  //       socket.close();
  //       // handleDisconnect();

  //       if (!unsavedChanges) return;
  //       e.preventDefault();
  //       return (e.returnValue = warningText);
  //     };
  //     const handleBrowseAway = () => {
  //       socket.close();

  //       handleDisconnect();

  //       if (!unsavedChanges) return;
  //       if (window.confirm(warningText)) return;
  //       router.events.emit("routeChangeError");
  //       throw "routeChange aborted.";
  //     };
  //     window.addEventListener("beforeunload", handleWindowClose);
  //     router.events.on("routeChangeStart", handleBrowseAway);
  //     return () => {
  //       // handleDisconnect();

  //       window.removeEventListener("beforeunload", handleWindowClose);
  //       router.events.off("routeChangeStart", handleBrowseAway);
  //     };
  //   }
  // }, [unsavedChanges]);

  // useEffect(() => {
  //   const exitingFunction = () => {
  //     socket.emit(EVENTS.CLIENT.CONNECT_ME, "nfuidsuisfi");
  //     console.log("exiting...");
  //   };

  //   router.events.on("routeChangeStart", exitingFunction);

  //   return () => {
  //     socket.emit(EVENTS.CLIENT.CONNECT_ME, "nfuidsuisfi");
  //     router.events.off("routeChangeStart", exitingFunction);
  //   };
  // }, []);

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

  function handleDisconnect() {
    // TODO for reloading page, closing tab or window, or clciking or back button or clicking on home page
    console.log("disconnecting user");
    disconnectUser();
    router.push({
      pathname: "/",
    });
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

  async function handleDisconnect2() {
    try {
      setLoading(true);
      await disconnectUser2();
      setLoading(false);

      router.push({
        pathname: "/",
      });
    } catch (error) {
      alert(error);
      router.push({
        pathname: "/",
      });
      console.error("Error during disconnection:", error);
    }
  }

  async function canJoinRoom(id: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      socket.emit(EVENTS.CLIENT.REQUEST_JOIN, id);
      socket.on(EVENTS.SERVER.REQUEST_JOIN_RESPONSE, (value: boolean) => {
        resolve(value);
      });
    });
  }
  // useEffect(() => {
  //   async function checkCanJoinRoom() {
  //     if (!roomId) return false;
  //     const canJoin = await canJoinRoom(roomId);
  //     return canJoin;
  //   }

  //   checkCanJoinRoom().then((canJoin) => {
  //     if (!canJoin) {
  //       // Render the appropriate message or redirect to the join page
  //       router.push("/find");
  //     }
  //   });

  //   // ...
  // }, [roomId]);

  const joinRoomCallback = (canJoin: boolean) => {
    console.log("lanchug the page");
    if (canJoin) {
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
  };
  // useEffect(() => {
  //   console.log("getting something here");
  //   socket.emit(EVENTS.CLIENT.REQUEST_JOIN, roomId);

  //   socket.on(EVENTS.SERVER.REQUEST_JOIN_RESPONSE, (value: boolean) => {
  //     joinRoomCallback(value);
  //   });
  // }, [roomId]);

  // if (!roomId) {
  //   //no server side validation i think which is bad which i need
  //   //we should say if (roomId.getRedis.exists && username.getRedis.authorized)
  //   //then show chat
  //   //else show u are not authorized blank page
  //   // router.push("/");
  //   return (
  //     <Container
  //       // bgImage="url(https://media.giphy.com/media/iI9IY9XXl2eKmDpQMY/giphy.gif)"
  //       // bgRepeat="no-repeat"
  //       // bgSize="cover"
  //       bgColor="#0A1A3C"
  //       maxW="container.2xl"
  //     >
  //       <Center pt={4} px={4} minHeight="100vh">
  //         <VStack>
  //           <Container maxW="container.md" textAlign="center">
  //             <Heading
  //               fontFamily="inter"
  //               fontWeight="extrabold"
  //               size="4xl"
  //               mb={4}
  //               color="#F0F443"
  //             >
  //               Seems like you are not authorized to view this chat room
  //             </Heading>

  //             <Button
  //               mt={8}
  //               px={16}
  //               borderRadius="1rem"
  //               h="4em"
  //               _hover={{
  //                 bgColor: "#6DD9FF",
  //               }}
  //               bgColor="#43BBF4"
  //               onClick={() => {
  //                 Router.push({
  //                   pathname: "/",
  //                 });
  //               }}
  //             >
  //               Go back
  //             </Button>
  //           </Container>
  //         </VStack>
  //       </Center>
  //     </Container>
  //   );
  // }
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
          <Modal isLoading={loading} isOpen={isOpen} onClose={onClose}>
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
                <Button
                  isLoading={loading}
                  colorScheme="red"
                  onClick={handleDisconnect2}
                >
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
