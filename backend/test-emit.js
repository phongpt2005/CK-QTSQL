const { io } = require('socket.io-client');

const socket = io('http://localhost:3000/allocation', {
  query: { userId: '2' }, // act as phone (user 2)
});

socket.on('connect', () => {
  console.log('Connected as user 2');
  
  // Emit scan:product with targetUserId = 1 (the PC)
  console.log('Emitting scan:product to targetUserId: 1');
  socket.emit('scan:product', { productCode: 'PROD001', requiredQty: 1, targetUserId: 1 });
});

socket.on('modal:open', (data) => {
  console.log('User 2 received modal:open:', data.draft.draftId);
  process.exit(0);
});

socket.on('error', (err) => {
  console.error('Error:', err);
  process.exit(1);
});
