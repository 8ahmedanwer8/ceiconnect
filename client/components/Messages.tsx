import { useSockets } from "../context/sockets.context";
import { useEffect, useRef } from "react";
import EVENTS from "../config/events";
import { formatAMPM } from "../utils/helpers";

function Messages() {
  const { socket, messages, roomId, username, setMessages } = useSockets();
  const usernameString = username.current; //crappy solution to the problem where i wanna make randomgen username part of the context but i need to use useRef bc using useState and initialzing it causes nextjs to render two different versions of the username during the prerender and the real render since it is a random username each time. so i use a useRef instead to avoid having to use useState. i also cant just intitialize useState inside of useEffect cuz that will be infinite loop i think
  const newMessageRef = useRef(null);
  const messageEndRef = useRef(null);

  function handleSendMessage() {
    const message = newMessageRef.current.value;
    if (!String(message).trim()) {
      return;
    }
    console.log("this is the messag we arer sendidng", usernameString);
    socket.emit(EVENTS.CLIENT.SEND_ROOM_MESSAGE, {
      roomId,
      message,
      usernameString,
    });

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
