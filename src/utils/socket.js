import { io } from "socket.io-client";

let socket = null;

export const initSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
      "http://localhost:5000",
    {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    }
  );

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default {
  initSocket,
  getSocket,
  disconnectSocket,
};
