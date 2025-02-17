const socketIO = require('socket.io');
const Message = require('../models/message.model');
const jwt = require('jsonwebtoken');

const setupSocket = (server) => {
    const io = socketIO(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        },
        transports: ['websocket', 'polling']
    });

    // Middleware для проверки токена
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.userId);

        socket.on('join_chat', (chatId) => {
            socket.join(chatId);
            console.log(`User ${socket.userId} joined chat ${chatId}`);
        });

        socket.on('send_message', async (data) => {
            try {
                const { chatId, content, imageUrl } = data;
                
                if (!chatId) {
                    throw new Error('ChatId is required');
                }

                const message = new Message({
                    chatId,
                    senderId: socket.userId,
                    content,
                    imageUrl
                });

                await message.save();
                
                // Отправляем сообщение всем участникам чата
                io.to(chatId).emit('receive_message', message);
            } catch (err) {
                console.error('Error handling message:', err);
                socket.emit('error', { message: 'Failed to process message' });
            }
        });

        socket.on('receive_message', async (data) => {
            try {
                const message = await Message.findById(data._id);
                if (message) {
                    message.status = 'delivered';
                    await message.save();
                    io.emit('message_status_update', {
                        messageId: message._id,
                        status: 'delivered'
                    });
                }
            } catch (err) {
                console.error('Error updating message status:', err);
            }
        });

        socket.on('message_read', async (data) => {
            try {
                const message = await Message.findById(data.messageId);
                if (message) {
                    message.status = 'read';
                    await message.save();
                    io.emit('message_status_update', {
                        messageId: message._id,
                        status: 'read'
                    });
                }
            } catch (err) {
                console.error('Error updating message read status:', err);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.userId);
        });
    });

    return io;
};

module.exports = setupSocket;
