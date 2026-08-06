const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('./config/logger').child({ module: 'socket' });

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL ,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.use((socket, next) => {
    let token = socket.handshake.auth?.token;

    if (!token && socket.handshake.headers.cookie) {
      const cookies = socket.handshake.headers.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      token = cookies.token || cookies.jwt || cookies.access_token; 
    }

    if (!token) {
      logger.warn('Socket authentication failed: token missing', { socketId: socket.id });
      return next(new Error("Authentication error: Token missing"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      logger.warn('Socket authentication failed: invalid token', {
        socketId: socket.id,
        error: err.message,
      });
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.email;

    socket.join(`user_${userId}`);
    logger.info('User connected', { userId, socketId: socket.id, room: `user_${userId}` });

    socket.on('disconnect', () => {
      logger.info('User disconnected', { userId, socketId: socket.id });
    });
  });

  return io;
};

const sendNotification = (recipientId, event, data) => {
  if (io) {
    io.to(`user_${recipientId}`).emit(event, data);
  }
};

module.exports = { initSocket, sendNotification };