# Video Calling App — Server

Signaling server for the video calling app. It relays WebRTC session metadata (offers, answers, ICE negotiation) between peers over Socket.IO. **It does not stream audio or video** — media flows peer-to-peer in the browser.

## Tech Stack

- Node.js
- [Socket.IO](https://socket.io/) v4

## How It Works

The server listens on **port 8000** and acts as a message broker:

| Event | Direction | Purpose |
|-------|-----------|---------|
| `room:join` | Client → Server | Join a room by email and room ID |
| `user:joined` | Server → Room | Notify others that someone joined |
| `room:join` | Server → Joiner | Confirm join and redirect client to room |
| `user:call` | Client → Server → Peer | Send WebRTC offer to callee |
| `incoming:call` | Server → Callee | Deliver incoming call offer |
| `call:accepted` | Client → Server → Caller | Send WebRTC answer back |
| `peer:nego:needed` | Client → Server → Peer | Renegotiate connection (e.g. new tracks) |
| `peer:nego:done` / `peer:nego:final` | Client ↔ Server ↔ Peer | Complete renegotiation |

Two in-memory maps track `email ↔ socket.id` for routing messages to the correct peer.

## Prerequisites

- Node.js 18+

## Setup & Run

```bash
cd server
npm install
npm start
```

This runs `nodemon index.js`, which auto-restarts on file changes. You should see `socket connected` logs when clients connect.

## Configuration

- **Port:** `8000` (hardcoded in `index.js`)
- **CORS:** enabled for all origins

To change the port, edit the first argument in `new Server(8000, ...)` in `index.js` and update the client’s Socket.IO URL to match.
