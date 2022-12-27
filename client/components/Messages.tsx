import { useSockets } from "../context/sockets.context";
import { useRef } from "react";
import EVENTS from "../config/events";

function Messages() {
  const { socket, messages, roomId, username, setMessages } = useSockets();
  const newMessageRef = useRef(null);

  function handleSendMessage() {
    const message = newMessageRef.current.value;
    if (!String(message).trim()) {
      return;
    }
    socket.emit(EVENTS.CLIENT.SEND_ROOM_MESSAGE, { roomId, message, username });

    const date = new Date();
    console.log(messages);

    //apparently here we are doing a "lite" version of how messaging is probably
    //supposed to be done. like, i think you're supposed to broadcast an event or
    //something and that will also allow you to have an ID associated with each message
    //but here theres no idea and no event broadcasting or something
    setMessages([
      ...messages,
      {
        username: "You",
        message,
        time: `${date.getHours()}:${date.getMinutes()}`,
      },
    ]);
  }

  if (!roomId) {
    return <div />;
  }

  return (
    <div>
      {messages.map(({ message }, index) => {
        return <p key={index}>{message}</p>;
      })}

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
