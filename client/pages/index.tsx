import { Inter } from "@next/font/google";
import { useSockets } from "../context/sockets.context";
const inter = Inter({ subsets: ["latin"] });
import LandingSection from "../components/Homepage/LandingSection";
import InfoSection from "../components/Homepage/InfoSection";

import { useRef } from "react";

import { Box } from "@chakra-ui/react";
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
