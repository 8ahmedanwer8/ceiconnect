import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import config from "config";

const port = config.get<number>("port");
const host = config.get<string>("host");
