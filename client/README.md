# Video Calling App — Client

React frontend for 1-to-1 video calls. Users join a room from a lobby, then establish a peer-to-peer WebRTC connection for audio and video. Socket.IO is used only for signaling; media never passes through the server.

## Tech Stack

- React 19 + Vite
- React Router
- Socket.IO Client
- WebRTC (`RTCPeerConnection`)

## How It Works

### App structure

```
src/
├── context/SocketProvider.jsx   # Shared Socket.IO connection (localhost:8000)
├── service/peer.js              # WebRTC peer connection singleton
├── screen/lobby.jsx             # Enter email + room ID to join
└── screen/room.jsx              # Video call UI and signaling logic
```

### User flow

1. **Lobby** — Enter your email and a room ID, then click **Join the room**.
2. **Join** — Client emits `room:join`; server confirms and the app navigates to `/room/:roomId`.
3. **Wait for peer** — When another user joins the same room, status shows **Connected**.
4. **Call** — Click **CALL** to request camera/mic, create a WebRTC offer, and send it via the server.
5. **Answer** — The other user automatically accepts: gets media, creates an answer, and the P2P stream starts.
6. **End Call** — Stops local tracks and clears streams.

### WebRTC

`peer.js` wraps a single `RTCPeerConnection` with Google/Twilio STUN servers for NAT traversal. Renegotiation is handled when tracks are added (`negotiationneeded` event).

## Setup & Run

```bash
cd client
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Notes

- Socket URL is hardcoded to `localhost:8000` in `SocketProvider.jsx`.
- Designed for **two users per room** (1-to-1 calls).
- No TURN server is configured; calls may fail on restrictive networks.
