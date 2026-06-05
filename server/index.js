const { Server } = require("socket.io");
const io = new Server(8000, {
  cors: true,
});
const emailToSocketIdMap = new Map();
const socketIdToMailMap = new Map();
io.on("connection", (socket) => {
  console.log("socket connected", socket.id);
  socket.on("room:join", (data) => {
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketIdToMailMap.set(socket.id, email);

    const existingRoom = io.sockets.adapter.rooms.get(room);
    if (existingRoom) {
      for (const socketId of existingRoom) {
        if (socketId !== socket.id) {
          const existingEmail = socketIdToMailMap.get(socketId);
          socket.emit("user:joined", { email: existingEmail, id: socketId });
        }
      }
    }

    socket.join(room);
    socket.to(room).emit("user:joined", { email, id: socket.id });
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incoming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  socket.on("ice:candidate", ({ to, candidate }) => {
    io.to(to).emit("ice:candidate", { from: socket.id, candidate });
  });
});
