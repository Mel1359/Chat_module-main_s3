import { loadMessages, sendMessage, appendMessage, createMessageElement } from './messageModule.js';
import { getSocket } from './socketModule.js';
import { getCurrentChatId } from './chatModule.js';
import { getUserId } from './userModule.js';

jest.mock('./socketModule.js');
jest.mock('./chatModule.js');
jest.mock('./userModule.js');

describe('Message Module', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="chat-box"></div>
            <input id="message-input" />
            <div id="attachment-preview"></div>
        `;
        localStorage.clear();
    });

    test('createMessageElement создает элемент сообщения', () => {
        getUserId.mockReturnValue('1');
        
        const message = {
            senderId: '1',
            content: 'Test message',
            createdAt: new Date(),
            imageUrl: 'test.jpg'
        };

        const element = createMessageElement(message);
        
        expect(element.className).toContain('sent');
        expect(element.querySelector('.message-text').textContent).toBe('Test message');
        expect(element.querySelector('.message-image').src).toContain('test.jpg');
    });

    test('sendMessage отправляет сообщение через сокет', async () => {
        const mockSocket = { emit: jest.fn() };
        getSocket.mockReturnValue(mockSocket);
        getCurrentChatId.mockReturnValue('1');

        const messageInput = document.getElementById('message-input');
        messageInput.value = 'Test message';

        await sendMessage();

        expect(mockSocket.emit).toHaveBeenCalledWith('send_message', {
            chatId: '1',
            content: 'Test message',
            imageUrl: null
        });
        expect(messageInput.value).toBe('');
    });
}); 