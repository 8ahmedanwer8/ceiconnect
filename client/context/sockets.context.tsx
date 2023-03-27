import { createContext, useEffect, useRef, useContext, useState } from "react";
import io, { Socket } from "socket.io-client";
import { SOCKET_URL } from "../config/default";
import EVENTS from "../config/events";
import { generateRandomUsername } from "../utils/helpers";

interface Context {
  socket: Socket;
  roomId?: string;
  otherUsername?: object; //name of the person user is talking to
  username?: object;
  rooms: object;
  messages?: { message: string; time: string; username: string }[];
  setMessages: Function;
}

const socket = io(SOCKET_URL);
const SocketsContext = createContext<Context>({
  socket,
  setMessages: () => false,
  rooms: {},
  messages: [],
});

function SocketsProvider(props: any) {
  const username = useRef(null);
  const otherUsername = useRef(null);

  const [roomId, setRoomId] = useState("");
  const [rooms, setRooms] = useState({});
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    username.current = generateRandomUsername();
    window.onfocus = function () {
      document.title = "CeiConnect";
    };
  }, []);

  socket.on(EVENTS.SERVER.ROOMS, (value) => setRooms(value));

  socket.on(EVENTS.SERVER.JOINED_ROOM, (value) => {
    setRoomId(value);
    setMessages([]);
  });

  useEffect(() => {
    socket.on(EVENTS.SERVER.ROOM_MESSAGE, ({ message, username, time }) => {
      if (!document.hasFocus()) {
        document.title = "New message";
      }

      setMessages((messages) => [...messages, { message, username, time }]);
    });
  }, [socket]);

  useEffect(() => {
    socket.on(EVENTS.SERVER.OTHER_USERNAME, (value) => {
      otherUsername.current = value;
    });
  }, [socket]);

  return (
    <SocketsContext.Provider
      value={{
        socket,
        rooms,
        username,
        otherUsername,
        roomId,
        messages,
        setMessages,
      }}
      {...props}
    />
  );
}
export const useSockets = () => useContext(SocketsContext);
export default SocketsProvider;
