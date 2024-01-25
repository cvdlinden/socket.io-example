const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

var streamState = null;
var streamMetadata = null;

// Set root index html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Init socket
io.on('connection', (socket) => {

  // New user connected
  console.log('* client connected');
  socket.broadcast.emit('user-connect'); // Send to everyone except the user
  // On connection we check if this is the first client to connect
  // If it is, the interval is started
  // console.log("* No. clients:", io.sockets.sockets.size);
  if (io.sockets.sockets.size === 1) {
    startStreamingState();
    startStreamingMetadata()
  }

  // On disconnect
  socket.on('disconnect', () => {
    console.log('* client disconnected');
    socket.broadcast.emit('user-disconnect'); // Send to everyone except the user
    // On disconnection we check the number of connected users
    // If there is none, the interval is stopped
    if (io.sockets.sockets.size === 0) {
      stopStreamingState();
      stopStreamingMetadata();
    }
  });

  // On chat message, send to all
  socket.on('chatmsg', (msg) => {
    console.log('chatmsg: ' + msg);
    io.emit('chatmsg', msg);
  });

  // Catch-all listeners (DEBUG)
  socket.onAny((eventName, ...args) => {
    console.log("IN", eventName, args);
  });
  socket.onAnyOutgoing((eventName, ...args) => {
    console.log("OUT", eventName, args);
  });

});

// Start listening
server.listen(3000, () => {
  console.log('listening on http://localhost:3000');
});

// Functions

// The function startStreamingState starts streaming data to all the users
// Every second
function startStreamingState(clients) {
  console.log("Start streaming state...");
  streamState = setInterval(() => {
    io.emit("state", Date.now());
  }, 1000);
}

// The function stopStreamingState stops streaming data to all the users
function stopStreamingState() {
  console.log("Stop streaming state!");
  clearInterval(streamState);
}

// The function startStreamingMetadata starts streaming data to all the users
// Every 5 seconds
function startStreamingMetadata(clients) {
  console.log("Start streaming metadata...");
  // Start 'immediately', in half a second
  setTimeout(() => {
    io.emit("metadata");
  },500)
  // Set interval
  streamMetadata = setInterval(() => {
    io.emit("metadata", {
      "name": "Foo",
      "address": "Bar",
      "modes": [2, 4, 8, 16, 32, 64, 128, 256]
    });
  }, 5000);
}

// The function stopStreamingMetadata stops streaming data to all the users
function stopStreamingMetadata() {
  console.log("Stop streaming metadata!");
  clearInterval(streamMetadata);
}
