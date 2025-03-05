const request = require('supertest');
const express = require('express');
const { upload } = require('../config/s3');
const authenticateToken = require('../middleware/auth');

jest.mock('../config/s3');
jest.mock('../middleware/auth');

const app = express();
app.use('/api/upload', require('./uploadRoutes'));

describe('Upload Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        authenticateToken.mockImplementation((req, res, next) => {
            req.user = { userId: 'test-user-id' };
            next();
        });
    });

    describe('POST /', () => {
        test('успешная загрузка файла', async () => {
            const mockFile = {
                location: 'https://s3.example.com/test.jpg'
            };

            upload.single.mockImplementation((fieldName) => (req, res, next) => {
                req.file = mockFile;
                next();
            });

            const response = await request(app)
                .post('/api/upload')
                .attach('file', Buffer.from('test'), 'test.jpg');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('url', mockFile.location);
        });

        test('обработка отсутствия файла', async () => {
            upload.single.mockImplementation((fieldName) => (req, res, next) => {
                next();
            });

            const response = await request(app)
                .post('/api/upload');

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Файл не загружен');
        });

        test('обработка ошибки загрузки', async () => {
            upload.single.mockImplementation((fieldName) => (req, res, next) => {
                throw new Error('Upload error');
            });

            const response = await request(app)
                .post('/api/upload')
                .attach('file', Buffer.from('test'), 'test.jpg');

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Ошибка загрузки файла');
        });
    });
}); 