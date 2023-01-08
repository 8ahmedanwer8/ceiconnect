import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import { useSockets } from "../context/sockets.context";
const inter = Inter({ subsets: ["latin"] });
import EVENTS from "../config/events";
import Messages from "../components/Messages";

import { useState, useEffect } from "react";

export default function Find() {
  const { socket, rooms, username, roomId } = useSockets();

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
      console.log("Connected to servers"); //text shown in loading modal
      console.log(`Found ${otherWaitingUsers.length} online`);
      if (otherWaitingUsers.length <= 1) {
        //theres nobody else besides this user on the app
        //add retry and waiting logic

        console.log("Waiting for someone");
        socket.on("CONNECTEDWITHYOU", (roomkey) => {
          console.log("someone found meeee");
        });

        // const interval = setInterval(() => {
        //   console.log("Waiting for someone");

        //   // socket.on(EVENTS.SERVER.JOINED_ROOM, () => {
        //   //   console.log("found someone and joined them");
        //   // });
        // }, 3000);

        // return () => clearInterval(interval);
      } else {
        console.log("Connecting with someone");
        socket.emit(EVENTS.CLIENT.CONNECT_ME, username);
        socket.on(EVENTS.SERVER.CONNECTED, (rooms) => {
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
    findSomeone();
  }, [username]);

  return (
    <div>
      <p>Your user name is {JSON.stringify(username)}</p>
      some loading screen
      <div>rooms</div>
      <p> {JSON.stringify(rooms)}</p>
      <Messages></Messages>
    </div>
  );
}
