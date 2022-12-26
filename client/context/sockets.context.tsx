import { createContext, useContext, useState } from "react";
import io, { Socket } from "socket.io-client";
import { SOCKET_URL } from "../config/default";
import EVENTS from "../config/events";

interface Context {
  socket: Socket;
  username?: string;
  setUsername: Function;
  roomId?: string;
  rooms: object;
}

const socket = io(SOCKET_URL);
const SocketsContext = createContext<Context>({
  socket,
  setUsername: () => false,
  rooms: {},
});

function SocketsProvider(props: any) {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [rooms, setRooms] = useState({});
  const [messages, setMessages] = useState([]);

  socket.on(EVENTS.SERVER.ROOMS, (value) => setRooms(value));

  socket.on(EVENTS.SERVER.JOINED_ROOM, (value) => {
    setRoomId(value);
    setMessages([]);
  });

  return (
    <SocketsContext.Provider
      value={{ socket, username, setUsername, rooms, roomId }}
      {...props}
    />
  );
}
export const useSockets = () => useContext(SocketsContext);
export default SocketsProvider;
