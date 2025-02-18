import { getSocket } from './socketModule.js';
import { getCurrentChatId } from './chatModule.js';
import { getUserId } from './userModule.js';

let currentAttachment = null;

export const loadMessages = async (chatId) => {
    try {
        const response = await fetch(`/api/messages/${chatId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to load messages');

        const messages = await response.json();
        const chatBox = document.getElementById('chat-box');
        chatBox.innerHTML = '';
        messages.forEach(message => appendMessage(message));
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (error) {
        console.error('Error loading messages:', error);
    }
};

export const sendMessage = async () => {
    const messageInput = document.getElementById('message-input');
    const content = messageInput.value.trim();
    const preview = document.getElementById('attachment-preview');
    
    if (!content && !currentAttachment) return;
    if (!getCurrentChatId()) return;

    try {
        const messageData = {
            chatId: getCurrentChatId(),
            content: content || null,
            imageUrl: currentAttachment || null
        };

        getSocket().emit('send_message', messageData);

        messageInput.value = '';
        if (preview) {
            preview.style.display = 'none';
        }
        currentAttachment = null;
        
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Ошибка отправки сообщения. Пожалуйста, попробуйте еще раз.');
    }
};

export const appendMessage = (message) => {
    const chatBox = document.getElementById('chat-box');
    const messageElement = createMessageElement(message);
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
};

export const createMessageElement = (message) => {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.senderId === getUserId() ? 'sent' : 'received'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (message.content) {
        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.textContent = message.content;
        contentDiv.appendChild(textDiv);
    }
    
    if (message.imageUrl) {
        const img = document.createElement('img');
        img.src = message.imageUrl;
        img.className = 'message-image';
        img.alt = 'Прикрепленное изображение';
        contentDiv.appendChild(img);
    }
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    const messageDate = new Date(message.createdAt);
    timeDiv.textContent = messageDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageElement.appendChild(contentDiv);
    messageElement.appendChild(timeDiv);
    
    return messageElement;
};

export const setCurrentAttachment = (url) => {
    currentAttachment = url;
};

export const getCurrentAttachment = () => currentAttachment; 