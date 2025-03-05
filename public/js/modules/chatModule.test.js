import { loadChats, displayChats, selectChat, getCurrentChatId } from './chatModule.js';
import { getSocket } from './socketModule.js';
import { loadMessages } from './messageModule.js';

jest.mock('./socketModule.js');
jest.mock('./messageModule.js');

describe('Chat Module', () => {
    let mockFetch;
    
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="chats-list"></div>
            <div id="current-chat-name"></div>
            <div id="message-form"></div>
        `;
        mockFetch = jest.fn();
        global.fetch = mockFetch;
        localStorage.clear();
        loadMessages.mockResolvedValue();
    });

    test('loadChats загружает и отображает чаты', async () => {
        const mockChats = [
            { _id: '1', name: 'Chat 1' },
            { _id: '2', name: 'Chat 2' }
        ];

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockChats)
        });

        localStorage.setItem('token', 'test-token');
        await loadChats();

        const chatsList = document.getElementById('chats-list');
        expect(chatsList.children.length).toBe(2);
        expect(chatsList.children[0].textContent).toBe('Chat 1');
    });

    test('selectChat правильно переключает чаты', async () => {
        const mockSocket = {
            emit: jest.fn()
        };
        getSocket.mockReturnValue(mockSocket);

        const mockChat = { _id: '1', name: 'Test Chat' };
        await selectChat(mockChat);

        expect(document.getElementById('current-chat-name').textContent).toBe('Test Chat');
        expect(document.getElementById('message-form').style.display).toBe('flex');
        expect(mockSocket.emit).toHaveBeenCalledWith('join_chat', '1');
        expect(loadMessages).toHaveBeenCalledWith('1');
    });
}); 