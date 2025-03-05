const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const authRoutes = require('./authRoutes');

jest.mock('../models/user.model');
jest.mock('jsonwebtoken');
jest.mock('../middleware/auth');

// Создаем тестовое приложение
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret';
    });

    describe('POST /', () => {
        test('успешная аутентификация', async () => {
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                password: 'password123',
                fullname: 'Test User'
            };

            User.findOne.mockResolvedValue(mockUser);
            jwt.sign.mockReturnValue('test-token');

            const response = await request(app)
                .post('/api/auth')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token', 'test-token');
            expect(response.body).toHaveProperty('fullname', 'Test User');
        });

        test('неверные учетные данные', async () => {
            User.findOne.mockResolvedValue(null);

            const response = await request(app)
                .post('/api/auth')
                .send({ email: 'wrong@example.com', password: 'wrongpass' });

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Неверный email или пароль');
        });

        test('ошибка сервера', async () => {
            User.findOne.mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .post('/api/auth')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Внутренняя ошибка сервера');
        });
    });

    describe('GET /verify', () => {
        test('проверка валидного токена', async () => {
            const response = await request(app)
                .get('/api/auth/verify')
                .set('Authorization', 'Bearer valid-token');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ valid: true });
        }, 10000);
    });
}); 