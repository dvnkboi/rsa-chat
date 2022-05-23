const express = require('express');

// Setup Express server
const app = express();
const http = require('http').Server(app);

// Attach Socket.io to server
const io = require('socket.io')(http);

// Serve web app directory
app.use(express.static('public'));

/** Manage behavior of each client socket connection */
io.on('connection', (socket) => {
  console.log(`new user ${socket.id}`);
  let currentRoom = null;

  /** Process a room join request. */
  socket.on('JOIN', (roomName) => {
    // Get chatroom info
    let room = io.sockets.adapter.rooms[roomName];

    // Reject join request if room already has more than 1 connection
    if (room && room.length > 1) {
      // Notify user that their join request was rejected
      io.to(socket.id).emit('ROOM_FULL', null);

      // Notify room that someone tried to join
      socket.broadcast.to(roomName).emit('INTRUSION_ATTEMPT', null);
    } else {
      // Leave current room
      socket.leave(currentRoom);

      // Notify room that user has left
      socket.broadcast.to(currentRoom).emit('USER_DISCONNECTED', null);

      // Join new room
      currentRoom = roomName;
      socket.join(currentRoom);

      // Notify user of room join success
      io.to(socket.id).emit('ROOM_JOINED', currentRoom);

      // Notify room that user has joined
      socket.broadcast.to(currentRoom).emit('NEW_CONNECTION', null);
    }
  });

  /** Broadcast a received message to the room */
  socket.on('MESSAGE', (msg) => {
    console.log(`New Message - ${msg.text}`);
    socket.broadcast.to(currentRoom).emit('MESSAGE', msg);
  });

  socket.on('ENABLE_ENC', () => {
    socket.broadcast.to(currentRoom).emit('ENABLE_ENC', null);
    console.log(`ENCRYPTION ENABLED`);
  });

  socket.on('DISABLE_ENC', () => {
    socket.broadcast.to(currentRoom).emit('DISABLE_ENC', null);
    console.log(`ENCRYPTION DISABLED`);
  });

  /** Broadcast a new publickey to the room */
  socket.on('PUBLIC_KEY', (key) => {
    socket.broadcast.to(currentRoom).emit('PUBLIC_KEY', key);
  });

  /** Broadcast a disconnection notification to the room */
  socket.on('disconnect', () => {
    socket.broadcast.to(currentRoom).emit('USER_DISCONNECTED', null);
  });
});

// Start server
const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`listening on port ${port}.`);
});
