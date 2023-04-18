import { IOType } from "child_process";
import { nanoid } from "nanoid";
import { Server, Socket } from "socket.io";
import logger from "./utils/logger";
import { formatAMPM } from "./utils/helpers";
import { SocketAddress } from "net";

//lifecycle of a chatroom => creation, both person join, one person leaves but the other can choose to stay
//when last person leaves, chatroom is deleted. at any time, unregistered members cant join if their id or token
//doesnt match whatever expected id/token is in the database/cache

const EVENTS = {
  connection: "connection",
  CLIENT: {
    CREATE_ROOM: "CREATE_ROOM",
    SEND_ROOM_MESSAGE: "SEND_ROOM_MESSAGE",
    JOIN_ROOM: "JOIN_ROOM",
    NEW_WAITING: "NEW_WAITING",
    WAITING_ROOM_MEMBERS: "WAITING_ROOM_MEMBERS",
    CONNECT_ME: "CONNECT_ME",
    MY_USERNAME: "MY_USERNAME",
  },
  SERVER: {
    ROOMS: "ROOMS",
    JOINED_ROOM: "JOINED_ROOM",
    ROOM_MESSAGE: "ROOM_MESSAGE",
    JOINED_WAITING_ROOM: "JOINED_WAITING_ROOM",
    CONNECTEDWITHYOU: "CONNECTEDWITHYOU",
    CONNECTED: "CONNECTED",
    OTHER_USERNAME: "OTHER_USERNAME",
  },
};

const rooms: Record<string, { name: string }> = {}; //we can use array here too

function socket({ io }: { io: Server }) {
  logger.info(`Sockets enabled`);
  const waitingRoomId = nanoid();

  const getSockets = async (io: Server, id: string) => {
    const sockets = await io.in(id).fetchSockets();
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
        const clientsInRoom = getSockets(io, waitingRoomId);
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
      //when a user is in the waiting room waiting to be paired up
      const currentSocketId = socket.id;
      const sockets = getSockets(io, waitingRoomId);
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

          socket.broadcast.emit(EVENTS.SERVER.ROOMS, rooms);

          socket
            .to(otherSocket.id)
            .emit(EVENTS.SERVER.CONNECTEDWITHYOU, newChatRoomId);

          socket
            .to(otherSocket.id)
            .emit(EVENTS.SERVER.JOINED_ROOM, newChatRoomId);

          socket
            .to(otherSocket.id)
            .emit(EVENTS.SERVER.CONNECTED, newChatRoomId);

          socket.emit(EVENTS.SERVER.JOINED_ROOM, newChatRoomId);
          socket.emit(EVENTS.SERVER.CONNECTED, newChatRoomId);
        }
      });
    });

    socket.on(EVENTS.CLIENT.MY_USERNAME, (data) => {
      const roomId = data.roomId;
      const username = data.username;
      const clients = getSockets(io, roomId);
      clients.then((clients) => {
        //clients as in the two users/roomates that are in the chat together
        const waitingUsers = clients.map(({ id }) => id);
        const otherSocket = clients.find((obj) => obj.id !== socket.id);
        if (otherSocket) {
          socket
            .to(otherSocket.id)
            .emit(EVENTS.SERVER.OTHER_USERNAME, username);
        } else {
          //maybe put throw some error here
        }
      });
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
        const date = new Date();

        socket.to(roomId).emit(EVENTS.SERVER.ROOM_MESSAGE, {
          message,
          username: usernameString,
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
