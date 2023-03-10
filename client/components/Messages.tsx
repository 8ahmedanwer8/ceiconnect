import { useSockets } from "../context/sockets.context";
import { useEffect, useRef } from "react";
import EVENTS from "../config/events";
import { formatAMPM } from "../utils/helpers";

function Messages() {
  const { socket, messages, roomId, username, setMessages } = useSockets();
  const newMessageRef = useRef(null);
  const messageEndRef = useRef(null);

  function handleSendMessage() {
    const message = newMessageRef.current.value;
    if (!String(message).trim()) {
      return;
    }
    socket.emit(EVENTS.CLIENT.SEND_ROOM_MESSAGE, { roomId, message, username });

    const date = new Date();

    //apparently here we are doing a "lite" version of how messaging is probably
    //supposed to be done. like, i think you're supposed to broadcast an event or
    //something and that will also allow you to have an ID associated with each message
    //but here theres no idea and no event broadcasting or something
    setMessages([
      ...messages,
      {
        username: "You",
        message,
        time: `${formatAMPM(date)}`,
      },
    ]);
    newMessageRef.current.value = "";
  }

  useEffect(() => {
    //when new message comes, it scrolls smoothly to it
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!roomId) {
    return <div />;
  }

  return (
    <div>
      {messages.map(({ message, username, time }, index) => {
        return (
          <p key={index}>
            {time} {username} {message}
          </p>
        );
      })}
      <div ref={messageEndRef}></div>

      <div>
        <textarea
          rows={1}
          placeholder="tell us what u are thinking"
          ref={newMessageRef}
        />
        <button onClick={handleSendMessage}>SEND </button>
      </div>
    </div>
  );
}
export default Messages;
