let socket = null;
let currentChatId = null;
let currentAttachment = null;

const USERS_LIST = [
    {
        id: "50",
        fullname: "Иванов Сергей Васильевич",
        email: "ivanov@mail.ru"
    },
    {
        id: "51",
        fullname: "Алексеев Петр Александрович",
        email: "alekseev@mail.ru"
    },
    {
        id: "52",
        fullname: "Дюма Анатолий Артемович",
        email: "duma@mail.ru"
    }
];

let selectedUser = null;

async function loadChats() {
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
}

function displayChats(chats) {
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
}

async function selectChat(chat) {
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
}

async function loadMessages(chatId) {
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
}

function getUserId() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

async function initializeSocket() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.replace('/login');
            return;
        }

        socket = io('http://localhost:3000', {
            auth: {
                token: token
            },
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('Connected to socket server');
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            if (error.message === 'Authentication error') {
                localStorage.removeItem('token');
                window.location.replace('/login');
            }
        });

        socket.on('receive_message', (message) => {
            appendMessage(message);
        });
    } catch (error) {
        console.error('Socket initialization error:', error);
    }
}

const sendButton = document.getElementById('send-button');
const messageInput = document.getElementById('message-input');

sendButton.removeEventListener('click', sendMessage);
messageInput.removeEventListener('keypress', handleEnter);

async function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const content = messageInput.value.trim();
    const preview = document.getElementById('attachment-preview');
    
    if (!content && !currentAttachment) return;
    if (!currentChatId) return;

    try {
        const messageData = {
            chatId: currentChatId,
            content: content || null,
            imageUrl: currentAttachment || null
        };

        // Отправляем через сокет
        socket.emit('send_message', messageData);

        // Очищаем поле ввода и превью изображения
        messageInput.value = '';
        if (preview) {
            preview.style.display = 'none';
        }
        currentAttachment = null;
        
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Ошибка отправки сообщения. Пожалуйста, попробуйте еще раз.');
    }
}

function appendMessage(message) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = createMessageElement(message);
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function createMessageElement(message) {
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
}

function handleEnter(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(e);
    }
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', handleEnter);

function displayUsers(users) {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';
    users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.className = 'user-item';
        userElement.textContent = user.fullname;
        userElement.onclick = () => {
            document.querySelectorAll('.user-item').forEach(el => 
                el.classList.remove('selected')
            );
            userElement.classList.add('selected');
            selectedUser = user;
            document.getElementById('confirmUserSelect').disabled = false;
        };
        usersList.appendChild(userElement);
    });
}

function showUserSelectModal() {
    const modal = document.getElementById('userSelectModal');
    const usersList = document.getElementById('usersList');
    const searchInput = document.getElementById('userSearch');
    const confirmButton = document.getElementById('confirmUserSelect');
    const cancelButton = document.getElementById('cancelUserSelect');
    
    modal.style.display = 'block';
    displayUsers(USERS_LIST);
    
    // Очищаем предыдущие обработчики
    confirmButton.onclick = null;
    cancelButton.onclick = null;
    
    // Настраиваем обработчики
    cancelButton.onclick = () => {
        modal.style.display = 'none';
        selectedUser = null;
        confirmButton.disabled = true;
    };
    
    confirmButton.onclick = async () => {
        if (selectedUser) {
            try {
                const currentUser = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));
                
                const response = await fetch('/api/chats', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: `Чат с ${selectedUser.fullname}`,
                        members: [currentUser.userId, selectedUser.id]
                    })
                });

                if (!response.ok) {
                    throw new Error('Ошибка при создании чата');
                }

                const newChat = await response.json();
                await loadChats();
                selectChat(newChat);
                
                modal.style.display = 'none';
                selectedUser = null;
                confirmButton.disabled = true;
            } catch (error) {
                console.error('Ошибка создания чата:', error);
                alert('Произошла ошибка при создании чата');
            }
        }
    };
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredUsers = USERS_LIST.filter(user => 
            user.fullname.toLowerCase().includes(searchTerm)
        );
        displayUsers(filteredUsers);
    });
}

async function validateToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.replace('/login');
        return false;
    }
    return true;
}

// Обновим обработчик загрузки DOM
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initializeSocket();
        await loadChats();
    } catch (error) {
        console.error('Initialization error:', error);
    }
});

function initializeImageUpload() {
    const imageUpload = document.getElementById('image-upload');
    const preview = document.getElementById('attachment-preview');
    const previewImage = document.getElementById('preview-image');
    const removeButton = document.getElementById('remove-attachment');
    const previewInfo = preview.querySelector('.preview-info span');

    imageUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                currentAttachment = data.url;
                previewImage.src = data.url;
                previewInfo.textContent = `Прикреплен файл: ${file.name}`;
                preview.style.display = 'flex';

            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Ошибка загрузки изображения. Пожалуйста, попробуйте еще раз.');
                imageUpload.value = '';
                currentAttachment = null;
                preview.style.display = 'none';
            }
        }
    });

    removeButton.onclick = () => {
        preview.style.display = 'none';
        imageUpload.value = '';
        currentAttachment = null;
        previewInfo.textContent = '';
    };
}

// Добавляем обработчик события при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    const newChatButton = document.getElementById('new-chat-button');
    if (newChatButton) {
        newChatButton.onclick = showUserSelectModal;
    }
    initializeImageUpload();
    if (sendButton) {
        sendButton.onclick = sendMessage;
    }
}); 