import { io } from 'socket.io-client';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

let socket = null;

export const initializeSocket = (userId, userName, userRole) => {
  if (socket) return socket;

  socket = io(BACKEND_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    socket.emit('join_room', { user_id: userId });
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const sendMessage = (message, senderId, senderName, senderRole, receiverId = null) => {
  if (!socket) {
    console.error('Socket not initialized');
    return;
  }

  socket.emit('send_message', {
    sender_id: senderId,
    sender_name: senderName,
    sender_role: senderRole,
    receiver_id: receiverId,
    message
  });
};

export const onNewMessage = (callback) => {
  if (!socket) return;
  socket.on('new_message', callback);
};

export const onMessageSent = (callback) => {
  if (!socket) return;
  socket.on('message_sent', callback);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default socket;
