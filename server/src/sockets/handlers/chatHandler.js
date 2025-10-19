const chatHandler = (io, socket) => {
  socket.on("statuses", (msg) => {
    io.emit("statuses", msg);
  });
};

export default chatHandler;
