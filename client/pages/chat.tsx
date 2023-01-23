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
    //client side validation i think which is bad
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
    <div>
      <div>{roomId}</div>
      <p>You are chatting with {otherUsername.current}</p>
      <Messages></Messages>
    </div>
  );
}
