const request = require('supertest');
const express = require('express');
const Chat = require('../models/chat.model');
const authenticateToken = require('../middleware/auth');

jest.mock('../models/chat.model');
jest.mock('../middleware/auth');

const app = express();
app.use(express.json());
app.use('/api/chats', require('./chatRoutes'));

describe('Chat Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        authenticateToken.mockImplementation((req, res, next) => {
            req.user = { userId: 'test-user-id' };
            next();
        });
    });

    describe('GET /', () => {
        test('получение списка чатов пользователя', async () => {
            const mockChats = [
                { _id: '1', name: 'Chat 1', members: ['test-user-id'] },
                { _id: '2', name: 'Chat 2', members: ['test-user-id'] }
            ];

            Chat.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockChats)
            });

            const response = await request(app).get('/api/chats');

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
            expect(Chat.find).toHaveBeenCalledWith({ members: 'test-user-id' });
        });

        test('обработка ошибки при получении чатов', async () => {
            Chat.find.mockImplementation(() => {
                throw new Error('Database error');
            });

            const response = await request(app).get('/api/chats');

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Внутренняя ошибка сервера');
        });
    });

    describe('POST /', () => {
        test('создание нового чата', async () => {
            const chatData = {
                name: 'New Chat',
                members: ['test-user-id', 'other-user-id']
            };

            Chat.findOne.mockResolvedValue(null);
            Chat.prototype.save.mockResolvedValue({ ...chatData, _id: '3' });

            const response = await request(app)
                .post('/api/chats')
                .send(chatData);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('name', chatData.name);
            expect(response.body).toHaveProperty('members');
        });

        test('возврат существующего чата', async () => {
            const existingChat = {
                _id: '1',
                name: 'Existing Chat',
                members: ['test-user-id', 'other-user-id']
            };

            Chat.findOne.mockResolvedValue(existingChat);

            const response = await request(app)
                .post('/api/chats')
                .send({ members: existingChat.members });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(existingChat);
        });
    });
}); 