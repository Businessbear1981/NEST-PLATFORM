import { io, Socket } from "socket.io-client";
import { getToken } from "@/lib/auth";

let socket: Socket | null = null;
let tokenInUse: string | null = null;

export function getSocket(): Socket {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const token = getToken();

  // Tear down and reconnect if the token changed (login/logout mid-session)
  if (socket && tokenInUse !== token) {
    socket.disconnect();
    socket = null;
  }

  if (socket && socket.connected) return socket;
  tokenInUse = token;
  socket = io(url, {
    transports: ["websocket"],
    autoConnect: true,
    auth: token ? { token } : {},
  });
  return socket;
}
