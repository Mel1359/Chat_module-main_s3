describe('Chat Script', () => {
    let mockSocket;

    beforeEach(() => {
        // Очищаем все моки
        jest.clearAllMocks();
        
        document.body.innerHTML = `
            <div id="chat-box"></div>
            <input id="message-input" />
            <button id="send-button"></button>
        `;

        mockSocket = {
            on: jest.fn((event, callback) => {
                if (event === 'receive_message') {
                    mockSocket.receiveMessageHandler = callback;
                }
                if (event === 'connect_error') {
                    mockSocket.errorHandler = callback;
                }
                return mockSocket;
            }),
            emit: jest.fn()
        };
        
        // Настраиваем глобальные моки с jest.fn()
        global.io = jest.fn(() => mockSocket);
        
        const token = 'test-token';
        global.localStorage = {
            getItem: jest.fn().mockImplementation(key => {
                if (key === 'token') return token;
                if (key === 'userId') return '123';
                if (key === 'chatId') return '456';
                return null;
            }),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn()
        };

        global.fetch = jest.fn(() => 
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ 
                    userId: '123',
                    chatId: '456'
                })
            })
        );

        // Настраиваем window.location
        delete window.location;
        window.location = {
            replace: jest.fn(),
            href: '/chat'
        };

        // Очищаем кэш модуля
        jest.resetModules();
    });

    test('проверка токена при загрузке', async () => {
        await import('./script');
        expect(fetch).toHaveBeenCalledWith('/api/user', {
            headers: { Authorization: 'Bearer test-token' }
        });
    });

    test('инициализация с валидным токеном', async () => {
        localStorage.getItem.mockImplementation(() => 'valid-token');
        await import('./script');
        
        expect(io).toHaveBeenCalledWith({
            auth: { token: 'valid-token' }
        });
    });

    test('отправка сообщения', async () => {
        await import('./script');
        
        // Заполняем поле ввода
        const messageInput = document.getElementById('message-input');
        messageInput.value = 'Hello, world!';
        
        // Нажимаем кнопку отправки
        const sendButton = document.getElementById('send-button');
        sendButton.click();

        // Проверяем, что сообщение было отправлено с правильными данными
        expect(mockSocket.emit).toHaveBeenCalledWith('send_message', {
            chatId: '456',
            senderId: '123',
            content: 'Hello, world!'
        });
    });

    test('получение сообщения', async () => {
        await import('./script');
        
        mockSocket.receiveMessageHandler({
            senderId: '789',
            content: 'Test message'
        });

        const chatBox = document.getElementById('chat-box');
        expect(chatBox.textContent).toContain('789: Test message');
    });

    test('обработка ошибки соединения', async () => {
        await import('./script');
        
        mockSocket.errorHandler(new Error('Connection failed'));

        expect(localStorage.removeItem).toHaveBeenCalledWith('token');
        expect(window.location.href).toBe('/login');
    });
}); 