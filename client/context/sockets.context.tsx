import { createContext, useContext, useState } from "react";
import io from "socket.io-client";
import { SOCKET_URL } from "../config/default";

const socket = io(SOCKET_URL);
const SocketsContext = createContext({ socket });

function SocketsProvider(props: any) {
  const [username, setUsername] = useState("");
  return (
    <SocketsContext.Provider
      value={{ socket, username, setUsername }}
      {...props}
    />
  );
}
export const useSockets = () => useContext(SocketsContext);
export default SocketsProvider;
