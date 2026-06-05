# Video Calling App

A simple peer-to-peer video calling app. Two users join the same room and call each other over WebRTC. A Node.js server handles signaling only — audio and video go directly between browsers.

## Project Structure
videoCallingApp/  
    ├── server/  
    └── client/   
See `server/README.md` and `client/README.md` for details on each part.
## How It Works
Users join a room from the lobby.
The server notifies peers and relays WebRTC signaling (offers, answers, negotiation).
Browsers connect directly for audio/video — the server does not stream media.
## Notes
Built for 1-to-1 calls (two users per room).
Server runs on port 8000; client connects to localhost:8000.
No TURN server — calls may fail on restrictive networks.
