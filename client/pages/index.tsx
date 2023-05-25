import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import { useSockets } from "../context/sockets.context";
import Link from "next/link";
const inter = Inter({ subsets: ["latin"] });
import LandingSection from "../components/Homepage/LandingSection";
import InfoSection from "../components/Homepage/InfoSection";

import Rooms from "../components/Rooms";
import Messages from "../components/Messages";
import { useRef } from "react";

import {
  Button,
  Box,
  UnorderedList,
  ListItem,
  Center,
  Container,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
export default function Home() {
  const { socket, username } = useSockets();
  const usernameRef = useRef(null);

  return (
    <Box>
      <LandingSection />
      <InfoSection />
    </Box>
  );
}
