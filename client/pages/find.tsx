import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import { useSockets } from "../context/sockets.context";
const inter = Inter({ subsets: ["latin"] });
import EVENTS from "../config/events";
import Messages from "../components/Messages";
import Router from "next/router";

import { useState, useEffect } from "react";

export default function Find() {
  const { socket, rooms, username, roomId } = useSockets();
  const [loadingText, setLoadingText] = useState("I am loading text");
  const [loading, setLoading] = useState(false);
  function findSomeone() {
    setLoading(true);
    const preferences = {
      IS: "Engineering",
      WANTS: "Nursing",
    };
    socket.emit(EVENTS.CLIENT.NEW_WAITING, {
      username: username,
      preferences,
    });

    socket.on(EVENTS.SERVER.JOINED_WAITING_ROOM, (otherWaitingUsers) => {
      setLoadingText(`Found ${otherWaitingUsers.length} online`);

      if (otherWaitingUsers.length <= 1) {
        //theres nobody else besides this user on the app
        //add retry and waiting logic
        setLoadingText("Looking for someone");

        // const interval = setInterval(() => {
        //   setLoadingText("Looking for someone");

        socket.on(EVENTS.SERVER.CONNECTEDWITHYOU, (roomkey) => {
          setLoadingText("Found someone!");
          setLoadingText("Joining room");

          //go to chat page
          Router.push("/chat");
        });
        // }, 5000);

        // return () => clearInterval(interval);
      } else {
        setLoadingText("Found someone!");
        socket.emit(EVENTS.CLIENT.CONNECT_ME, username);
        setLoadingText("Trying to connect with them");
        socket.on(EVENTS.SERVER.CONNECTED, (rooms) => {
          setLoadingText("Joining room");

          //go to chat page
          Router.push("/chat");
          console.log(roomId);
          console.log("THESE are the new rooms");
          console.log(rooms);
        });
      }
    });
  }

  useEffect(() => {
    // const nickname = generateRandomUsername();
    // username.current = nickname;
    // console.log(username);
    setLoadingText("Connected to Servers");

    findSomeone();
  }, [username]);

  return (
    <div>
      <p>Your user name is {JSON.stringify(username)}</p>
      <p>{loadingText}</p>
      some loading screen
      <div>rooms</div>
      <p> {JSON.stringify(rooms)}</p>
      <Messages></Messages>
    </div>
  );
}
