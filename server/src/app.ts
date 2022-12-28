import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import config from "config";
import logger from "./utils/logger";
import { version } from "../package.json";

import socket from "./socket";

const port = config.get<number>("port");
const host = config.get<string>("host");
const corsOrigin = config.get<string>("corsOrigin");

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  maxHttpBufferSize: 1e8,
  cors: {
    origin: corsOrigin,
    credentials: true,
  },
});

app.get("/", (_, res) =>
  res.send(`Server is up and running version ${version}`)
);

//using httpserver to listen instead of express's server
//so we can reuse this instance for sockets.io (according
//to some stack overflow explanation)

httpServer.listen(port, host, () => {
  logger.info(`Server is listening at Port ${port}`);
  socket({ io });
});
