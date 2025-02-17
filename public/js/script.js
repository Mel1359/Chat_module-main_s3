const token = localStorage.getItem('token');
if (!token) {
    console.log('Токен не найден в script.js');
    window.location.replace('/login');
}

const socket = io({
    auth: {
        token: token
    }
});

const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

let chatId = null;
let senderId = null;

fetch('/api/user', {
    headers: { Authorization: `Bearer ${token}` },
})
    .then((response) => {
        if (!response.ok) {
            throw new Error('Failed to load user data');
        }
        return response.json();
    })
    .then((data) => {
        senderId = data.userId;
        chatId = data.chatId;
    })
    .catch((err) => {
        console.error('Error loading user/chat data:', err);
        localStorage.removeItem('token');
        window.location.replace('/login');
    });

function sendMessage() {
    const content = messageInput.value.trim();
    console.log('Attempting to send message:', { chatId, senderId, content });
    if (content && chatId && senderId) {
        socket.emit('send_message', { chatId, senderId, content });
        messageInput.value = '';
    } else {
        console.error('Message not sent: Missing chatId, senderId, or content');
    }
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});

socket.on('receive_message', (data) => {
    console.log('Message received from server:', data);
    const messageElement = document.createElement('div');
    messageElement.textContent = `${data.senderId}: ${data.content}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
});

socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
    localStorage.removeItem('token');
    window.location.href = '/login';
});
