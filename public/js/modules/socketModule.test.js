import { initializeSocket, getSocket } from './socketModule';

// Мокаем socket.io-client
jest.mock('socket.io-client', () => ({
    io: jest.fn()
}));

describe('Socket Module', () => {
    let mockSocket;
    let mockIo;
    
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Создаем мок сокета
        mockSocket = {
            on: jest.fn(),
            emit: jest.fn()
        };
        
        // Получаем мок функции io
        mockIo = require('socket.io-client').io;
        mockIo.mockReturnValue(mockSocket);
        
        // Мок для window.location
        delete window.location;
        window.location = { replace: jest.fn() };
        
        // Мок для localStorage с использованием jest.fn()
        global.localStorage = {
            getItem: jest.fn(() => 'test-token'),
            removeItem: jest.fn(),
            setItem: jest.fn()
        };

        // Очищаем состояние модуля
        jest.isolateModules(() => {
            require('./socketModule');
        });
    });

    test('инициализация сокета с токеном', async () => {
        const socket = await initializeSocket();
        expect(mockIo).toHaveBeenCalledWith('http://localhost:3000', {
            auth: { token: 'test-token' },
            transports: ['websocket', 'polling']
        });
        expect(socket).toBe(mockSocket);
    });

    test('initializeSocket возвращает null без токена', async () => {
        global.localStorage.getItem.mockReturnValueOnce(null);
        const socket = await initializeSocket();
        expect(socket).toBeUndefined();
        expect(window.location.replace).toHaveBeenCalledWith('/login');
    });

    test('initializeSocket успешно инициализирует сокет', async () => {
        const socket = await initializeSocket();
        expect(socket.on).toHaveBeenCalledWith('connect', expect.any(Function));
        expect(socket.on).toHaveBeenCalledWith('connect_error', expect.any(Function));
    });

    test('getSocket возвращает текущий сокет', async () => {
        const socket = await initializeSocket();
        const retrievedSocket = getSocket();
        expect(retrievedSocket).toBe(socket);
    });

    test('обработка ошибки аутентификации', async () => {
        const socket = await initializeSocket();
        
        // Получаем обработчик ошибки
        const errorCallback = socket.on.mock.calls
            .find(([event]) => event === 'connect_error')[1];
            
        // Вызываем обработчик с ошибкой аутентификации
        errorCallback({ message: 'Authentication error' });
        
        expect(localStorage.removeItem).toHaveBeenCalledWith('token');
        expect(window.location.replace).toHaveBeenCalledWith('/login');
    });
}); 