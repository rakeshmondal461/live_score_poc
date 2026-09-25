import { useEffect, useState } from "react";
import { socket } from "./socket";

export function useSocket() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    // [LISTENER] connect
    // Fires when the socket successfully establishes a connection with the server.
    // Updates the isConnected state so consumers can conditionally render live indicators.
    function onConnect() {
      setIsConnected(true);
    }

    // [LISTENER] disconnect
    // Fires when the socket loses its connection (network drop, server restart, etc.).
    // Updates the isConnected state so consumers can show an offline/reconnecting indicator.
    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // Manually initiate the connection (autoConnect is disabled on the socket instance).
    socket.connect();

    return () => {
      // Clean up listeners and close the connection when the component unmounts.
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.disconnect();
    };
  }, []);

  return { socket, isConnected };
}
