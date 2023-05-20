import { IOType } from "child_process";
import { nanoid } from "nanoid";
import { Server, Socket } from "socket.io";
import logger from "./utils/logger";
import { formatAMPM } from "./utils/helpers";
import { SocketAddress } from "net";
import NodeCache from "node-cache";
import c from "config";
import { SERVFAIL } from "dns";

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
    DISCONNECT: "DISCONNECT",
  },
  SERVER: {
    ROOMS: "ROOMS",
    JOINED_ROOM: "JOINED_ROOM",
    ROOM_MESSAGE: "ROOM_MESSAGE",
    JOINED_WAITING_ROOM: "JOINED_WAITING_ROOM",
    CONNECTEDWITHYOU: "CONNECTEDWITHYOU",
    CONNECTED: "CONNECTED",
    OTHER_USERNAME: "OTHER_USERNAME",
    DISCONNECTED: "DISCONNECTED",
    LEFT_YOU: "LEFT_YOU",
    REQUEST_JOIN: "REQUEST_JOIN",
    REQUEST_JOIN_RESPONSE: "REQUEST_JOIN_RESPONSE",
  },
  USER_CONNECTION: {
    EXACT_MATCH: "EXACT_MATCH", //a wants b and b wants a
    PARTIAL_MATCH: "PARTIAL_MATCH", //a wants b and b wants c
    FREE_MATCH: "FREE_MATCH", // a wants b and no pref wants no pref
    NO_MATCH: "NO_MATCH", //refers to people that couldnt find any matches at all
  },
  PREFERENCES: {
    NO_PREFERENCES: "No preference",
    STEM: "STEM",
    HUMANITIES: "Humanities",
    BUSINESS: "Business",
    OTHER: "Other",
  },
};

const rooms: Record<string, { name: string }> = {}; //we can use array here too
const cache = new NodeCache();
const userConnectionCache = new NodeCache();

interface UserConnection {
  id: string;
  IS: string;
  WANTS: string;
  connection_type: string;
  connected: boolean;
}

interface Cache {
  [key: string]: string[];
}

interface Matches {
  exact: string[];
  partial: string[];
  free: string[];
  none: string[];
}

function getCacheAsString(cache: NodeCache) {
  let cacheToString = "Cache:\n";
  // Get the keys of the cache
  const keys = cache.keys();

  // Iterate over the keys and access the corresponding values
  for (const key of keys) {
    const value: string[] | undefined = cache.get(key);
    cacheToString += `${key}: [${value?.join(", ")}]\n`;
  }
  return cacheToString;
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function getSockets(io: Server, id: string) {
  const sockets = await io.in(id).fetchSockets();
  return sockets;
}

async function getMatches(
  io: Server,
  preferences: any,
  socketId: string,
  waitingRoomId: string
) {
  try {
    const socketList = await getSockets(io, waitingRoomId);
    const exactMatches: string[] = [];
    const partialMatches: string[] = [];
    const freeMatches: string[] = [];
    const noMatches: string[] = [];

    const socketIds: string[] = socketList
      .filter((socketData) => socketData.id !== socketId)
      .map((socketData) => socketData.id);

    for (const id of socketIds) {
      const socketStatus: UserConnection | undefined =
        userConnectionCache.get(id);

      if (
        socketStatus?.IS === preferences.WANTS &&
        socketStatus?.WANTS === preferences.IS &&
        socketStatus?.id
      ) {
        exactMatches.push(socketStatus.id);
      } else if (socketStatus?.WANTS === preferences.IS && socketStatus?.id) {
        partialMatches.push(socketStatus.id);
      } else if (
        socketStatus?.WANTS == EVENTS.PREFERENCES.NO_PREFERENCES &&
        socketStatus?.IS == EVENTS.PREFERENCES.NO_PREFERENCES &&
        socketStatus?.id
      ) {
        freeMatches.push(socketStatus.id);
      } else {
        if (socketStatus?.id) {
          noMatches.push(socketStatus.id);
        }
      }
    }

    const matches: Matches = {
      exact: exactMatches,
      partial: partialMatches,
      free: freeMatches,
      none: noMatches,
    };
    console.log(matches);

    return matches;
  } catch (error) {
    console.error("Error", error);
    const matches: Matches = {
      exact: [],
      partial: [],
      free: [],
      none: [],
    };
    return matches;
  }
}

function socket({ io }: { io: Server }) {
  logger.info(`Sockets enabled`);
  const waitingRoomId = nanoid();
  cache.set(waitingRoomId, []);

  async function delay() {
    await sleep(5000);
  }

  io.on(EVENTS.connection, (socket: Socket) => {
    logger.info(`User connected ${socket.id}`);

    socket.emit(EVENTS.SERVER.ROOMS, rooms);

    //when a user  wants to meet someone i.e. joins the waiting room
    socket.on(EVENTS.CLIENT.NEW_WAITING, (preferences) => {
      rooms[waitingRoomId] = {
        name: "WAITING_ROOM",
      };
      socket.join(waitingRoomId);
      userConnectionCache.set(socket.id, {
        id: socket.id,
        IS: preferences.IS,
        WANTS: preferences.WANTS,
        connection_type: EVENTS.USER_CONNECTION.EXACT_MATCH,
        connected: false,
      } as UserConnection);

      let data: string[] | undefined = cache.get(waitingRoomId);
      data?.push(socket.id);
      cache.set(waitingRoomId, data);
      logger.info(
        `Socket ${socket.id} joined waiting room. Room members now: ${cache.get(
          waitingRoomId
        )}`
      );

      logger.info(
        `User Connection Cache: ${JSON.stringify(
          userConnectionCache.get(socket.id)
        )}`
      );

      const cacheString = getCacheAsString(cache);
      console.log(`The complete room cache now ${cacheString}`);

      try {
        const clientsInRoom = getSockets(io, waitingRoomId);
        clientsInRoom.then((client) => {
          //how many clients/users can i have in the wainting room? i need to support 15k
          // Do something with the resolved value
          const waitingUsers = client.map(({ id }) => id);
          socket.emit(EVENTS.SERVER.JOINED_WAITING_ROOM, waitingUsers);
        });
      } catch (error) {
        //will think about sending error emit back later...
        console.log(`Failed to find users in waiting room. Error: ${error}`);
      }
    });

    socket.on(EVENTS.CLIENT.CONNECT_ME, (preferences) => {
      //when a user is in the waiting room waiting and requesting to be paired up
      const sockets = getSockets(io, waitingRoomId);
      let retryCount = 0;
      var otherSocket: any = null;
      var otherSocketId: string | null = null;
      const matchAndRetry = async () => {
        const matches = await getMatches(
          io,
          preferences,
          socket.id,
          waitingRoomId
        );
        console.log("exactMatches", matches.exact);
        console.log("partialMatches", matches.partial);
        console.log("freeMatches", matches.free);
        console.log("noMatches", matches.none);

        if (matches.exact.length === 0 && retryCount < 3) {
          retryCount++;
          console.log(
            "No exact matches found. Retrying (Attempt " + retryCount + ")..."
          );
          await delay(); // Delay before retrying

          // Call the function recursively
          await matchAndRetry();
        } else if (matches.exact.length === 0 && retryCount === 3) {
          console.log("No exact matches found after 3 retries.");
          console.log("Finding something else");
          otherSocketId =
            matches.exact.length > 0
              ? matches.exact[0]
              : matches.partial.length > 0
              ? matches.partial[0]
              : matches.free.length > 0
              ? matches.free[0]
              : matches.none.length > 0
              ? matches.none[0]
              : matches.none[0];
          const socketList = await sockets;
          otherSocket = socketList.find(
            (socket) => socket.id === otherSocketId
          );
        } else {
          // Handle the case when no matches are found after 3 retries
          otherSocketId = matches.exact[0];
          const socketList = await sockets;
          otherSocket = socketList.find(
            (socket) => socket.id === otherSocketId
          );
        }
      };

      (async () => {
        await matchAndRetry();
        if (otherSocket && otherSocketId) {
          const newChatRoomId = nanoid();
          socket.join(newChatRoomId);
          otherSocket.join(newChatRoomId);
          cache.set(newChatRoomId, []);
          let newData1 = [socket.id, otherSocket.id];
          cache.set(newChatRoomId, newData1);
          logger.info(`Created chat room with id ${newChatRoomId}`);
          logger.info(`Socket ${socket.id} joined room ${newChatRoomId}`);
          logger.info(`Socket ${otherSocket.id} joined room ${newChatRoomId}`);

          socket.leave(waitingRoomId);
          otherSocket.leave(waitingRoomId);
          logger.info(`Socket ${socket.id} left waiting room ${newChatRoomId}`);
          logger.info(
            `Socket ${otherSocket.id} left waiting room ${newChatRoomId}`
          );

          const cacheString = getCacheAsString(cache);
          console.log(`The complete room cache now ${cacheString}`);

          let data: string[] | undefined = cache.get(waitingRoomId);
          const newData2: string[] | undefined = data?.filter((element) => {
            element !== socket.id && element !== otherSocket.id;
          });

          cache.set(waitingRoomId, newData2);
          // rooms[currentSocketId] = {
          //   name: username,
          // };

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
      })();

      // const matches = getMatches(io, preferences, socket.id, waitingRoomId);
      // matches.then((res: Matches) => {
      //   console.log("exactMatches", res.exact);
      //   console.log("partialMatches", res.partial);
      //   console.log("freeMatches", res.free);
      //   console.log("noMatches", res.none);
      // exactmatch not found
      // retry: send emit that we are retrying
      // actually retry
      // try to find exact match but if not,
      //find the next greatest

      // const otherSocketId =
      //   res.exact.length > 0
      //     ? res.exact[0]
      //     : res.partial.length > 0
      //     ? res.partial[0]
      //     : res.free.length > 0
      //     ? res.free[0]
      //     : null;

      //   const otherSocketId = res.exact.length > 0 ? res.exact[0] : null;
      //   console.log(sockets.length);

      //   if (res.exact.length == 0) {
      //     delay().then(() => {
      //       socket.emit("SEARCH_RETRY");
      //       const sockets = getSockets(io, waitingRoomId);
      //       sockets.then((list) => {
      //         const newIds: string[] = list
      //           .filter((socketData) => socketData.id !== socket.id)
      //           .map((socketData) => socketData.id);
      //         console.log(newIds.length);
      //       });
      //     });
      //   }
      // });
      // console.log(otherSocket, otherSocketId);
      // if (otherSocket && otherSocketId) {
      //   const newChatRoomId = nanoid();
      //   socket.join(newChatRoomId);
      //   otherSocket.join(newChatRoomId);
      //   cache.set(newChatRoomId, []);
      //   let newData1 = [socket.id, otherSocket.id];
      //   cache.set(newChatRoomId, newData1);
      //   logger.info(`Created chat room with id ${newChatRoomId}`);
      //   logger.info(`Socket ${socket.id} joined room ${newChatRoomId}`);
      //   logger.info(`Socket ${otherSocket.id} joined room ${newChatRoomId}`);

      //   socket.leave(waitingRoomId);
      //   otherSocket.leave(waitingRoomId);
      //   logger.info(`Socket ${socket.id} left waiting room ${newChatRoomId}`);
      //   logger.info(
      //     `Socket ${otherSocket.id} left waiting room ${newChatRoomId}`
      //   );

      //   const cacheString = getCacheAsString(cache);
      //   console.log(`The complete room cache now ${cacheString}`);

      //   let data: string[] | undefined = cache.get(waitingRoomId);
      //   const newData2: string[] | undefined = data?.filter((element) => {
      //     element !== socket.id && element !== otherSocket.id;
      //   });

      //   cache.set(waitingRoomId, newData2);
      //   // rooms[currentSocketId] = {
      //   //   name: username,
      //   // };

      //   socket.broadcast.emit(EVENTS.SERVER.ROOMS, rooms);

      //   socket
      //     .to(otherSocket.id)
      //     .emit(EVENTS.SERVER.CONNECTEDWITHYOU, newChatRoomId);

      //   socket
      //     .to(otherSocket.id)
      //     .emit(EVENTS.SERVER.JOINED_ROOM, newChatRoomId);

      //   // socket
      //   //   .to(otherSocket.id)
      //   //   .emit(EVENTS.SERVER.CONNECTED, newChatRoomId);

      //   socket.emit(EVENTS.SERVER.JOINED_ROOM, newChatRoomId);
      //   socket.emit(EVENTS.SERVER.CONNECTED, newChatRoomId);
      // }
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

    //THIS CAN BE DELETED
    //when a user creates a new room
    socket.on(EVENTS.CLIENT.CREATE_ROOM, ({ roomName }) => {
      // console.log(roomName);

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

    //THIS CAN ALSO BE DELETED
    //when a user joins a room
    socket.on(EVENTS.CLIENT.JOIN_ROOM, ({ roomId }) => {
      socket.join(roomId);
      socket.emit(EVENTS.SERVER.JOINED_ROOM, roomId);
    });

    socket.on(EVENTS.CLIENT.DISCONNECT, ({ roomId, username }) => {
      //disconnect this socket from the room
      socket.leave(roomId);
      let data: string[] | undefined = cache.get(roomId);
      const newData = data?.filter((id) => id !== socket.id);
      cache.set(roomId, newData);
      logger.info(
        `Socket ${
          socket.id
        } left the room ${roomId}. Room members now: ${cache.get(roomId)}`
      );
      socket.emit(EVENTS.SERVER.DISCONNECTED, roomId);

      const sockets = getSockets(io, roomId);

      //tell the other socket that their friend has left the room
      sockets.then((socketList) => {
        const currentSocketId = socket.id;
        const otherSocket = socketList.find(
          (socket) => socket.id !== currentSocketId
        );
        if (otherSocket) {
          const date = new Date();
          socket.to(otherSocket.id).emit(EVENTS.SERVER.LEFT_YOU, username);
        } else {
          //room is empty after the second person leaving, so lets delete
          //the room from the cache
          cache.del(roomId);
          logger.info(`Room ${roomId} deleted from cache`);
        }
      });
    });

    socket.on(EVENTS.SERVER.REQUEST_JOIN, (roomId) => {
      const chatMembers: string[] | undefined = cache.get(roomId);
      if (
        chatMembers?.find((chatMemberId) => {
          return JSON.stringify(chatMemberId) === JSON.stringify(socket.id);
        })
      ) {
        socket.emit(EVENTS.SERVER.REQUEST_JOIN_RESPONSE, true);
      } else {
        socket.emit(EVENTS.SERVER.REQUEST_JOIN_RESPONSE, false);
      }
    });
  });
}

export default socket;
