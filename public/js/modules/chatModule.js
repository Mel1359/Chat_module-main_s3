import { getSocket } from './socketModule.js';

let currentChatId = null;

export const loadChats = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.replace('/login');
            return;
        }

        const response = await fetch('/api/chats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.replace('/login');
                return;
            }
            throw new Error('Failed to load chats');
        }

        const chats = await response.json();
        displayChats(chats);
    } catch (error) {
        console.error('Error loading chats:', error);
    }
};

export const displayChats = (chats) => {
    const chatsList = document.getElementById('chats-list');
    chatsList.innerHTML = '';

    chats.forEach(chat => {
        const chatElement = document.createElement('div');
        chatElement.className = 'chat-item';
        chatElement.textContent = chat.name;
        chatElement.onclick = () => selectChat(chat);
        
        if (currentChatId === chat._id) {
            chatElement.classList.add('active');
        }
        
        chatsList.appendChild(chatElement);
    });
};

export const selectChat = async (chat) => {
    const socket = getSocket();
    if (!socket) {
        console.error('Socket not initialized');
        return;
    }

    currentChatId = chat._id;
    document.getElementById('current-chat-name').textContent = chat.name;
    document.getElementById('message-form').style.display = 'flex';
    
    socket.emit('join_chat', chat._id);
    
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
        if (item.textContent === chat.name) {
            item.classList.add('active');
        }
    });

    await loadMessages(chat._id);
};

export const getCurrentChatId = () => currentChatId; 