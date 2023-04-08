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

    // <Box bgColor="gray.100" minH="100vh">
    //   <Box maxW="1200px" mx="auto" px="6" py="12">
    //     <Stack spacing="8">
    //       <Heading as="h1" size="3xl" textAlign="center">
    //         Daily News
    //       </Heading>
    //       <Text fontSize="xl" textAlign="center">
    //         Your trusted source for the latest news and stories from around the
    //         world
    //       </Text>
    //     </Stack>
    //     <Flex flexWrap="wrap" mt="12">
    //       <Box w={{ base: "100%", md: "50%" }} pr={{ base: "0", md: "4" }}>
    //         <Box mb="8">
    //           <Image src="/img/news1.jpg" alt="News 1" borderRadius="md" />
    //           <Heading size="lg" mt="4">
    //             Lorem ipsum dolor sit amet
    //           </Heading>
    //           <Text mt="2">
    //             Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
    //             lobortis ante ut lacus lobortis, eget commodo risus cursus.
    //           </Text>
    //         </Box>
    //         <Box mb="8">
    //           <Image src="/img/news2.jpg" alt="News 2" borderRadius="md" />
    //           <Heading size="lg" mt="4">
    //             Sed lobortis ante ut lacus lobortis
    //           </Heading>
    //           <Text mt="2">
    //             Sed lobortis ante ut lacus lobortis, eget commodo risus cursus.
    //             Nullam sit amet urna vel nunc convallis viverra sed a velit.
    //           </Text>
    //         </Box>
    //       </Box>
    //       <Box w={{ base: "100%", md: "50%" }} pl={{ base: "0", md: "4" }}>
    //         <Box mb="8">
    //           <Image src="/img/news3.jpg" alt="News 3" borderRadius="md" />
    //           <Heading size="lg" mt="4">
    //             Duis euismod justo sed velit faucibus
    //           </Heading>
    //           <Text mt="2">
    //             Duis euismod justo sed velit faucibus, eget laoreet enim rutrum.
    //             In hac habitasse platea dictumst. Sed sodales nulla sit amet
    //             ipsum tincidunt, non consequat justo blandit.
    //           </Text>
    //         </Box>
    //         <Box mb="8">
    //           <Image src="/img/news4.jpg" alt="News 4" borderRadius="md" />
    //           <Heading size="lg" mt="4">
    //             In hac habitasse platea dictumst
    //           </Heading>
    //           <Text mt="2">
    //             In hac habitasse platea dictumst. Pellentesque eu semper justo.
    //             Ut venenatis enim vel magna dignissim rhoncus. Sed eget
    //             vestibulum velit. Sed dignissim lorem sed mi dictum, sed
    //             vulputate sapien ultricies.
    //           </Text>
    //         </Box>
    //       </Box>
    //     </Flex>
    //   </Box>
    // </Box>
  );
}
