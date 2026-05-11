const { io } = require('socket.io-client');

const socket = io('http://localhost:3000/allocation', {
  query: { userId: '1' },
});

socket.on('connect', () => {
  console.log('Connected to socket', socket.id);
  
  // Simulate phone scanning the QR for the target user (which is also 1, because the PC is user 1)
  console.log('Emitting scan:product...');
  socket.emit('scan:product', { productCode: 'PROD001', requiredQty: 1, targetUserId: 1 });
});

socket.on('modal:open', (data) => {
  console.log('Received modal:open', JSON.stringify(data, null, 2));
  setTimeout(() => process.exit(0), 1000);
});

socket.on('error', (err) => {
  console.error('Socket error:', err);
  setTimeout(() => process.exit(1), 1000);
});

socket.on('disconnect', () => {
  console.log('Disconnected from socket');
});

setTimeout(() => {
  console.log('Timeout. Did not receive modal:open');
  process.exit(1);
}, 5000);
