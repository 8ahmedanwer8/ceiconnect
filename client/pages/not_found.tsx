import { useRouter } from "next/router";
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
export default function Custom404() {
  const router = useRouter();

  return (
    <Container
      // bgImage="url(https://media.giphy.com/media/iI9IY9XXl2eKmDpQMY/giphy.gif)"
      // bgRepeat="no-repeat"
      // bgSize="cover"
      bgColor="#0A1A3C"
      maxW="container.2xl"
    >
      <Center pt={4} px={4} minHeight="100vh">
        <VStack>
          <Container maxW="container.md" textAlign="center">
            <Heading
              fontFamily="inter"
              fontWeight="extrabold"
              size="4xl"
              mb={4}
              color="#F0F443"
            >
              Seems like you are not authorized to view this chat room
            </Heading>
            <Button
              mt={8}
              px={16}
              borderRadius="1rem"
              h="4em"
              _hover={{
                bgColor: "#6DD9FF",
              }}
              bgColor="#43BBF4"
              onClick={() => {
                router.push({
                  pathname: "/",
                });
              }}
            >
              Go back
            </Button>
          </Container>
        </VStack>
      </Center>
    </Container>
  );
}
