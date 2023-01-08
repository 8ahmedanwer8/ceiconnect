import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import { useSockets } from "../context/sockets.context";
import Link from "next/link";
const inter = Inter({ subsets: ["latin"] });

import Rooms from "../components/Rooms";
import Messages from "../components/Messages";
import { useRef } from "react";

export default function Home() {
  const { socket, username, setUsername } = useSockets();
  const usernameRef = useRef(null);

  function handleSetUsername() {
    const value = usernameRef.current.value;
    if (!value) {
      return;
    }
    setUsername(value);
    localStorage.setItem("username", value);
  }

  return (
    // <div>
    //   {!username && ( //ignoring classnames for divs bc i dont wanna style much
    //     <div>
    //       <input placeholder="Username" ref={usernameRef} />
    //       <button onClick={handleSetUsername}>START</button>
    //     </div>
    //   )}
    //   {username && (
    //     <div>
    //       <Rooms></Rooms>
    //       <Messages></Messages>
    //     </div>
    //   )}
    // </div>
    <div>
      <button>
        <Link href="/find">Jump in a chat now</Link>
      </button>
      {/* return <button onClick={handleFind}>Talk with someone now</button>; */}
    </div>
  );
}
