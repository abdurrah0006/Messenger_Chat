import { io } from "socket.io-client";

const url = import.meta.env.VITE_SOCKET_URL;
const options = { autoConnect: false };

// One shared connection for the whole app. It is connected and disconnected
// by SocketProvider, and the JWT is attached to the handshake there.
export const socket = url ? io(url, options) : io(options);
