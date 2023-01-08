import { IOType } from "child_process";
import { nanoid } from "nanoid";
import { Server, Socket } from "socket.io";
import logger from "./utils/logger";
import { formatAMPM } from "./utils/helpers";
const EVENTS = {
  connection: "connection",
  CLIENT: {
    CREATE_ROOM: "CREATE_ROOM",
    SEND_ROOM_MESSAGE: "SEND_ROOM_MESSAGE",
    JOIN_ROOM: "JOIN_ROOM",
    NEW_WAITING: "NEW_WAITING",
    WAITING_ROOM_MEMBERS: "WAITING_ROOM_MEMBERS",
    CONNECT_ME: "CONNECT_ME",
  },
  SERVER: {
    ROOMS: "ROOMS",
    JOINED_ROOM: "JOINED_ROOM",
    ROOM_MESSAGE: "ROOM_MESSAGE",
    JOINED_WAITING_ROOM: "JOINED_WAITING_ROOM",
    CONNECTED: "CONNECTED",
  },
};

const rooms: Record<string, { name: string }> = {}; //we can use array here too

function socket({ io }: { io: Server }) {
  logger.info(`Sockets enabled`);
  const waitingRoomId = nanoid();

  const getWaitingUsers = async (io: Server) => {
    const waitingUsers = await io.in(waitingRoomId).fetchSockets();
    return waitingUsers;
  };

  const getSockets = async (io: Server) => {
    const sockets = await io.in(waitingRoomId).fetchSockets();
    return sockets;
  };

  io.on(EVENTS.connection, (socket: Socket) => {
    logger.info(`User connected ${socket.id}`);

    socket.emit(EVENTS.SERVER.ROOMS, rooms);

    //when a user  wants to meet someone i.e. joins the waiting room
    socket.on(EVENTS.CLIENT.NEW_WAITING, (username, preferences) => {
      rooms[waitingRoomId] = {
        name: "WAITING_ROOM",
      };
      socket.join(waitingRoomId);

      try {
        const clientsInRoom = getWaitingUsers(io);
        clientsInRoom.then((client) => {
          //how many clients/users can i have in the wainting room? i need to support 15k
          // Do something with the resolved value
          const waitingUsers = client.map(({ id }) => id);
          console.log("upon trying to connect, we have the following list");
          console.log(waitingUsers);
          console.log("current user is ", socket.id);

          socket.emit(EVENTS.SERVER.JOINED_WAITING_ROOM, waitingUsers);
        });
      } catch (error) {
        //will think about sending error emit back later...
        console.log(`Failed to find users in waiting room. Error: ${error}`);
      }
    });

    socket.on(EVENTS.CLIENT.CONNECT_ME, (username) => {
      console.log("the nickname");
      console.log(username);
      //take client user id
      //find other clients in the waiting room again
      const currentSocketId = socket.id;
      const sockets = getSockets(io);
      sockets.then((socketList) => {
        const newChatRoomId = nanoid();
        const otherSocket = socketList.find(
          (socket) => socket.id !== currentSocketId
        );
        if (otherSocket) {
          socket.join(newChatRoomId);
          otherSocket.join(newChatRoomId);

          socket.leave(waitingRoomId);
          otherSocket.leave(waitingRoomId);

          rooms[currentSocketId] = {
            name: username,
          };
          const clients = getWaitingUsers(io);
          clients.then((client) => {
            const waitingUsers = client.map(({ id }) => id);
            console.log("now we have this");

            console.log(waitingUsers);
          });

          socket.to(otherSocket.id).emit("CONNECTEDWITHYOU", newChatRoomId);

          socket.broadcast.emit(EVENTS.SERVER.ROOMS, rooms);

          socket
            .to(otherSocket.id)
            .emit(EVENTS.SERVER.JOINED_ROOM, newChatRoomId);
          socket
            .to(otherSocket.id)
            .emit(EVENTS.SERVER.CONNECTED, newChatRoomId);

          socket.emit(EVENTS.SERVER.JOINED_ROOM, newChatRoomId);
          socket.emit(EVENTS.SERVER.CONNECTED, rooms);
        }
      });
      //create a room
      //make client join that room, make other user join that room
      //room both users from waiting room

      //user enter a room
    });

    //when a user creates a new room
    socket.on(EVENTS.CLIENT.CREATE_ROOM, ({ roomName }) => {
      console.log(roomName);

      //create room id
      const roomId = nanoid();

      // add new room to room object
      rooms[roomId] = {
        name: roomName,
      };

      //socket.join roomid
      socket.join(roomId);
      //broadcast an event syaing theres a new room
      socket.broadcast.emit(EVENTS.SERVER.ROOMS, rooms);

      //emit back to the room creator with all the rooms
      socket.emit(EVENTS.SERVER.ROOMS, rooms);

      //emit event back to room creator syaing they have joined the room
      socket.emit(EVENTS.SERVER.JOINED_ROOM, roomId);
    });

    //when a user sends a message in the rooom
    socket.on(
      EVENTS.CLIENT.SEND_ROOM_MESSAGE,
      ({ roomId, message, usernameString }) => {
        console.log("the user name is", usernameString);
        const date = new Date();

        socket.to(roomId).emit(EVENTS.SERVER.ROOM_MESSAGE, {
          message,
          username: JSON.stringify(usernameString),
          time: `${formatAMPM(date)}`,
        });
      }
    );

    //when a user joins a room
    socket.on(EVENTS.CLIENT.JOIN_ROOM, (roomId) => {
      socket.join(roomId);
      socket.emit(EVENTS.SERVER.JOINED_ROOM, roomId);
    });
  });
}

export default socket;
