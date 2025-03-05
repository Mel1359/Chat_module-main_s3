const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/message.model');
const setupSocket = require('./socket');

jest.mock('socket.io');
jest.mock('../models/message.model');
jest.mock('jsonwebtoken');

describe('Socket Configuration', () => {
    let io;
    let socket;
    let savedMessage;
    
    beforeEach(() => {
        jest.clearAllMocks();
        
        savedMessage = {
            _id: '789',
            chatId: '456',
            senderId: '123',
            content: 'Test message',
            imageUrl: 'test.jpg'
        };

        socket = {
            handshake: { auth: { token: 'test-token' } },
            userId: '123',
            join: jest.fn(),
            emit: jest.fn(),
            on: jest.fn()
        };
        
        io = {
            use: jest.fn(),
            on: jest.fn(),
            to: jest.fn().mockReturnThis(),
            emit: jest.fn()
        };
        
        socketIO.mockReturnValue(io);
        jwt.verify.mockReturnValue({ userId: '123' });

        Message.mockImplementation(() => ({
            save: jest.fn().mockResolvedValue(savedMessage)
        }));
    });

    test('настройка middleware для аутентификации', () => {
        setupSocket({});
        
        const middleware = io.use.mock.calls[0][0];
        const next = jest.fn();
        
        middleware(socket, next);
        expect(jwt.verify).toHaveBeenCalledWith('test-token', process.env.JWT_SECRET);
        expect(socket.userId).toBe('123');
        expect(next).toHaveBeenCalled();
    });

    test('обработка отправки сообщения', async () => {
        setupSocket({});
        
        const connectionHandler = io.on.mock.calls[0][1];
        connectionHandler(socket);

        const messageHandler = socket.on.mock.calls.find(call => call[0] === 'send_message')[1];
        
        await messageHandler({
            chatId: '456',
            content: 'Test message',
            imageUrl: 'test.jpg'
        });

        expect(io.to).toHaveBeenCalledWith('456');
        expect(io.emit).toHaveBeenCalledWith('receive_message', savedMessage);
    });
}); 