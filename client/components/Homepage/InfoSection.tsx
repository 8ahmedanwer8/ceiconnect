import {
  Box,
  Container,
  Center,
  VStack,
  UnorderedList,
  ListItem,
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
function InfoSection() {
  return (
    <Container
      // bgImage="url(https://media.giphy.com/media/iI9IY9XXl2eKmDpQMY/giphy.gif)"
      // bgRepeat="no-repeat"
      // bgSize="cover"
      maxW="container.2xl"
    >
      <Center pt={8} px={4}>
        <VStack>
          <Container maxW="container.md">
            <Heading
              textAlign="center"
              fontWeight="bold"
              fontFamily="roboto"
              size="2xl"
              mb={4}
              color="#171A21"
            >
              What is this?
            </Heading>
            <Text mt={4} fontSize="xm" fontFamily="roboto">
              CeiConnect was developed by students for students to help people
              develop connections and friendships with people they otherwise
              would have never approached in real life. CeiConnect lets you
              instant chat with other students on campus anonymously in the
              hopes that you can meet them on campus later. It works in a
              roulette-fashion so you get matched up with a stranger and you can
              skip that stranger (mean) and get paired up with another one.
            </Text>
            <Text mt={4} fontSize="xm" fontFamily="roboto">
              We ask for your location to ensure that you are in the radius of
              the University. This hopes to ensure that users of the app are
              actually University of Windsor students.
            </Text>
            <Text mt={4} fontSize="xm" fontFamily="roboto">
              Note: We are not responsible for dying
            </Text>
          </Container>
        </VStack>
      </Center>
    </Container>
  );
}
export default InfoSection;
