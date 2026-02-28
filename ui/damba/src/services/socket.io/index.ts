import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:3000";

// You can type your server->client and client->server events later (see TS section below)
export const socket: Socket = io(SOCKET_URL, {
  transports: ["websocket"],     // prefer websocket
  autoConnect: false,            // connect manually
  withCredentials: true,         // if you use cookies/auth
});