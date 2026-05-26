import React, { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";
const SocketContext = createContext(null);
export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};
export const Socketprovider = (props) => {
  const socket = useMemo(() => io("localhost:8000"), []);

  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};
