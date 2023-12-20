const io = require('socket.io-client');

// Connect to the Socket.io server
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to the server.');

  // Emit the 'selectGameType' event to the server
  socket.emit('selectGameType', {
    gameType: 'tic-tac-toe',
    playerId: 'testPlayerId',
  });
});

// Listen for the 'selectGameTypeResponse' event
socket.on('selectGameTypeResponse', (data) => {
  console.log('selectGameTypeResponse:', data);
});

// Listen for the 'exception' event
socket.on('exception', (error) => {
  console.error('Exception:', error);
});

// Listen for the 'availableGames' event
socket.on('availableGames', (sessions) => {
  console.log('Available games:', sessions);
});

// Handle connection error
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
