// creates rooms and joins rooms
import { useSockets } from "../context/sockets.context";
import { useRef } from "react";
import EVENTS from "../config/events";
function Rooms() {
  const { socket, roomId, rooms } = useSockets();
  const newRoomRef = useRef(null);

  function handleCreateRoom() {
    //getroomname
    const roomName = newRoomRef.current.value || "";

    if (!String(roomName).trim()) return;

    //emit room created event
    socket.emit(EVENTS.CLIENT.CREATE_ROOM, { roomName });

    //set room name input to empty string
    newRoomRef.current.value = "";
  }
  return (
    <nav>
      <div>
        <input ref={newRoomRef} placeholder="Room name" />
        <button onClick={handleCreateRoom}>CREATE ROOM</button>
      </div>
      {Object.keys(rooms).map((key) => {
        return (
          <div key={key}>
            {key} {rooms[key].name}
          </div>
        );
      })}
    </nav>
  );
}
export default Rooms;
