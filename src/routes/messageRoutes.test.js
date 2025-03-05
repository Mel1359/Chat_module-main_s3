const request = require('supertest');
const express = require('express');
const Message = require('../models/message.model');
const authenticateToken = require('../middleware/auth');

jest.mock('../models/message.model');
jest.mock('../middleware/auth');

const app = express();
app.use(express.json());
app.use('/api/messages', require('./messageRoutes'));

describe('Message Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        authenticateToken.mockImplementation((req, res, next) => {
            req.user = { userId: 'test-user-id' };
            next();
        });
        global.io = { 
            to: jest.fn().mockReturnValue({ 
                emit: jest.fn() 
            }) 
        };
    });

    describe('GET /:chatId', () => {
        test('получение сообщений чата', async () => {
            const mockMessages = [
                { _id: '1', content: 'Message 1', chatId: 'chat-1' },
                { _id: '2', content: 'Message 2', chatId: 'chat-1' }
            ];

            Message.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockMessages)
            });

            const response = await request(app)
                .get('/api/messages/chat-1');

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
            expect(Message.find).toHaveBeenCalledWith({ chatId: 'chat-1' });
        });
    });

    describe('POST /', () => {
        test('создание нового сообщения', async () => {
            const messageData = {
                chatId: 'chat-1',
                content: 'New message',
                imageUrl: 'image.jpg'
            };

            const savedMessage = {
                ...messageData,
                _id: '3',
                senderId: 'test-user-id'
            };

            Message.mockImplementation(() => ({
                save: jest.fn().mockResolvedValue(savedMessage)
            }));

            const response = await request(app)
                .post('/api/messages')
                .send(messageData);

            expect(response.status).toBe(201);
            expect(response.body).toEqual(savedMessage);
            expect(global.io.to).toHaveBeenCalledWith('chat-1');
            expect(global.io.to().emit).toHaveBeenCalledWith('receive_message', savedMessage);
        });

        test('валидация обязательных полей', async () => {
            const response = await request(app)
                .post('/api/messages')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });
}); 