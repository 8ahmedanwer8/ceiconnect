import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import { useSockets } from "../context/sockets.context";
const inter = Inter({ subsets: ["latin"] });

import Rooms from "../components/Rooms";
import Messages from "../components/Messages";

export default function Home() {
  const { socket } = useSockets();
  return (
    <div>
      <Rooms></Rooms>
      <Messages></Messages>
    </div>
  );
}
