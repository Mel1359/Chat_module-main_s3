const mongoose = require('mongoose');
const connectDB = require('./db');

jest.mock('mongoose');

describe('Database Connection', () => {
    let consoleSpy;
    let exitSpy;
    
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        
        consoleSpy = {
            log: jest.spyOn(console, 'log').mockImplementation(),
            error: jest.spyOn(console, 'error').mockImplementation()
        };
        exitSpy = jest.spyOn(process, 'exit').mockImplementation();
        process.env.MONGO_URI = 'mongodb://test:27017/testdb';
    });

    afterEach(() => {
        jest.useRealTimers();
        consoleSpy.log.mockRestore();
        consoleSpy.error.mockRestore();
        exitSpy.mockRestore();
    });

    test('успешное подключение к MongoDB', async () => {
        mongoose.connect.mockResolvedValueOnce();
        await connectDB();
        expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI);
        expect(consoleSpy.log).toHaveBeenCalledWith('MongoDB connected');
    });

    test('таймаут подключения к MongoDB', async () => {
        mongoose.connect.mockImplementation(() => new Promise(() => {}));
        
        const connectPromise = connectDB();
        
        // Запускаем таймеры и ждем их выполнения
        await Promise.resolve();
        jest.runAllTimers();
        await Promise.resolve();

        await expect(connectPromise).rejects.toThrow('MongoDB connection timeout');
        expect(consoleSpy.error).toHaveBeenCalled();
        expect(exitSpy).toHaveBeenCalledWith(1);
    });

    test('ошибка подключения к MongoDB', async () => {
        const error = new Error('Connection failed');
        mongoose.connect.mockRejectedValueOnce(error);
        await connectDB();
        expect(consoleSpy.error).toHaveBeenCalledWith('MongoDB connection error:', error);
        expect(exitSpy).toHaveBeenCalledWith(1);
    });
}); 