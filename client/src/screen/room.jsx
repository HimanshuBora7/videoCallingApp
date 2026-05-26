import React, {
  useEffect,
  useCallback,
  usesState,
  useState,
  useRef,
} from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined the room`);
    setRemoteSocketId(id);
  });
  const handleCallUser = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      console.log("Stream obtained!", stream); // <-- CHECK YOUR CONSOLE
      setMyStream(stream);
    } catch (err) {
      console.error("Failed to get camera!", err);
    }
  }, []);
  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    return () => {
      socket.off("user:joined", handleUserJoined);
    };
  }, [socket, handleUserJoined]);
  return (
    <div>
      <h1>Room page</h1>
      <h4>{remoteSocketId ? "Connected" : "No one in the room"}</h4>
      {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
      {myStream && (
        <ReactPlayer
          playing
          muted
          height="300px"
          width="600px"
          url={myStream}
        />
      )}
    </div>
  );
};
export default RoomPage;
