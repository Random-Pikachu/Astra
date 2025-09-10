const { Server } = require('socket.io');
let io;

function init(server) {
  io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    console.log('socket connected:', socket.id);
    socket.on('join', (room) => {
      if (room) socket.join(room);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

module.exports = { init, getIO };