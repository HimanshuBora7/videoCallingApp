import React, { useEffect, useCallback, useState, useRef } from "react";
import { useSocket } from "../context/SocketProvider";
import peer from "../service/peer";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [peerKey, setPeerKey] = useState(0);
  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteSocketIdRef = useRef(null);

  const setRemoteId = useCallback((id) => {
    remoteSocketIdRef.current = id;
    setRemoteSocketId(id);
  }, []);

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined the room`);
    setRemoteId(id);
  }, [setRemoteId]);

  const sendIceCandidate = useCallback(
    (event) => {
      if (event.candidate && remoteSocketIdRef.current) {
        socket.emit("ice:candidate", {
          to: remoteSocketIdRef.current,
          candidate: event.candidate,
        });
      }
    },
    [socket],
  );

  const handleCallUser = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);

      for (const track of stream.getTracks()) {
        peer.peer.addTrack(track, stream);
      }

      const offer = await peer.getOffer();
      socket.emit("user:call", { to: remoteSocketIdRef.current, offer });
    } catch (err) {
      console.error("Failed to get camera!", err);
    }
  }, [socket]);

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);

      for (const track of stream.getTracks()) {
        peer.peer.addTrack(track, stream);
      }

      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket, setRemoteId],
  );

  const handleCallAccepted = useCallback(async ({ ans }) => {
    await peer.setRemoteDescription(ans);
    console.log("call accepted");
  }, []);

  const handleIceCandidate = useCallback(async ({ candidate }) => {
    try {
      await peer.addIceCandidate(candidate);
    } catch (err) {
      console.error("Failed to add ICE candidate", err);
    }
  }, []);

  const handleNegoNeedIncoming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket],
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setRemoteDescription(ans);
  }, []);

  const handleNegoNeeded = useCallback(async () => {
    if (!isConnected || !remoteSocketIdRef.current) return;
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", {
      offer,
      to: remoteSocketIdRef.current,
    });
  }, [isConnected, socket]);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("ice:candidate", handleIceCandidate);
    socket.on("peer:nego:needed", handleNegoNeedIncoming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("ice:candidate", handleIceCandidate);
      socket.off("peer:nego:needed", handleNegoNeedIncoming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleIceCandidate,
    handleNegoNeedIncoming,
    handleNegoNeedFinal,
  ]);

  useEffect(() => {
    if (myVideoRef.current && myStream) {
      myVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    const handleTrack = (ev) => {
      const stream =
        ev.streams?.[0] ?? new MediaStream([ev.track]);
      console.log("got remote track");
      setRemoteStream(stream);
    };

    const handleConnectionState = () => {
      if (peer.peer.connectionState === "connected") {
        setIsConnected(true);
      }
    };

    peer.peer.addEventListener("track", handleTrack);
    peer.peer.addEventListener("connectionstatechange", handleConnectionState);
    peer.peer.addEventListener("icecandidate", sendIceCandidate);
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);

    return () => {
      peer.peer.removeEventListener("track", handleTrack);
      peer.peer.removeEventListener(
        "connectionstatechange",
        handleConnectionState,
      );
      peer.peer.removeEventListener("icecandidate", sendIceCandidate);
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [sendIceCandidate, handleNegoNeeded, peerKey]);

  const handleEndCall = useCallback(() => {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
    }
    peer.resetPeer();
    setPeerKey((k) => k + 1);
    setMyStream(null);
    setRemoteStream(null);
    setIsConnected(false);
    setRemoteId(null);
  }, [myStream, setRemoteId]);

  return (
    <div>
      <h1>Room page</h1>
      <h4>{remoteSocketId ? "Connected" : "No one in the room"}</h4>
      {remoteSocketId && !myStream && (
        <button onClick={handleCallUser}>CALL</button>
      )}
      <h2>My Stream</h2>
      <video
        ref={myVideoRef}
        autoPlay
        muted
        playsInline
        height="200px"
        width="300px"
      />
      <h2>Remote Stream</h2>
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        height="300px"
        width="600px"
      />
      {myStream && (
        <button
          onClick={handleEndCall}
          style={{ backgroundColor: "red", color: "white" }}
        >
          End Call
        </button>
      )}
    </div>
  );
};

export default RoomPage;
