const socketIO = require('socket.io');

let io;

const initSocket = (server) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'https://dubleulearn.vercel.app',
    'https://mern-final-project-dubleu-x.vercel.app',
    process.env.CLIENT_URL
  ].filter(Boolean);

  io = socketIO(server, {
    cors: {
      origin: function (origin, callback) {
        // Allow requests with no origin
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.some(allowedOrigin => origin.startsWith(allowedOrigin))) {
          callback(null, true);
        } else {
          console.log('🚫 Socket.io CORS blocked for origin:', origin);
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    },
    // Additional performance options
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling']
  });

  console.log('🔌 Socket.io initialized with CORS for origins:', allowedOrigins);

  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);
    console.log('🔗 Socket origin:', socket.handshake.headers.origin);

    // Send connection confirmation
    socket.emit('connection-established', { 
      message: 'Connected to DubleuLearn server',
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });

    socket.on('join-course', (courseId) => {
      if (!courseId) {
        console.log('❌ No courseId provided for join-course');
        return;
      }
      
      socket.join(courseId);
      console.log(`📚 User ${socket.id} joined course ${courseId}`);
      
      // Notify others in the course
      socket.to(courseId).emit('user-joined', {
        userId: socket.id,
        courseId: courseId,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('leave-course', (courseId) => {
      if (courseId) {
        socket.leave(courseId);
        console.log(`🚪 User ${socket.id} left course ${courseId}`);
      }
    });

    socket.on('send-message', (data) => {
      try {
        const { courseId, message, userId, userName } = data;
        
        if (!courseId || !message) {
          console.log('❌ Invalid message data:', data);
          return;
        }

        console.log(`💬 Message in course ${courseId} from ${userName || userId}:`, message);
        
        // Broadcast to everyone in the course including sender
        io.to(courseId).emit('new-message', {
          id: Date.now().toString(),
          courseId,
          message,
          userId: userId || socket.id,
          userName: userName || 'Anonymous',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ Error handling message:', error);
      }
    });

    socket.on('typing-start', (data) => {
      const { courseId, userName } = data;
      if (courseId) {
        socket.to(courseId).emit('user-typing', {
          userName,
          isTyping: true,
          timestamp: new Date().toISOString()
        });
      }
    });

    socket.on('typing-stop', (data) => {
      const { courseId, userName } = data;
      if (courseId) {
        socket.to(courseId).emit('user-typing', {
          userName,
          isTyping: false,
          timestamp: new Date().toISOString()
        });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ User disconnected:', socket.id, 'Reason:', reason);
      
      // Notify all rooms this user was in
      const rooms = Object.keys(socket.rooms);
      rooms.forEach(room => {
        if (room !== socket.id) { // Skip the default room
          socket.to(room).emit('user-left', {
            userId: socket.id,
            roomId: room,
            timestamp: new Date().toISOString()
          });
        }
      });
    });

    // Handle connection errors
    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initSocket, getIO };