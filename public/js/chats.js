import { initializeSocket, getSocket } from './modules/socketModule.js';
import { loadChats, selectChat } from './modules/chatModule.js';
import { sendMessage, appendMessage } from './modules/messageModule.js';
import { USERS_LIST, displayUsers, getSelectedUser, setSelectedUser } from './modules/userModule.js';
import { initializeImageUpload } from './modules/imageModule.js';

const showUserSelectModal = async () => {
    const modal = document.getElementById('userSelectModal');
    const searchInput = document.getElementById('userSearch');
    const confirmButton = document.getElementById('confirmUserSelect');
    const cancelButton = document.getElementById('cancelUserSelect');
    
    modal.style.display = 'block';
    displayUsers(USERS_LIST);
    
    confirmButton.onclick = null;
    cancelButton.onclick = null;
    
    cancelButton.onclick = () => {
        modal.style.display = 'none';
        setSelectedUser(null);
        confirmButton.disabled = true;
    };
    
    confirmButton.onclick = async () => {
        const selectedUser = getSelectedUser();
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
                setSelectedUser(null);
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
};

const handleEnter = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const socket = await initializeSocket();
        if (socket) {
            socket.on('receive_message', (message) => {
                appendMessage(message);
            });
        }
        await loadChats();
        
        const sendButton = document.getElementById('send-button');
        const messageInput = document.getElementById('message-input');
        const newChatButton = document.getElementById('new-chat-button');

        if (sendButton && messageInput) {
            sendButton.addEventListener('click', sendMessage);
            messageInput.addEventListener('keypress', handleEnter);
        }

        if (newChatButton) {
            newChatButton.onclick = showUserSelectModal;
        }

        initializeImageUpload();
    } catch (error) {
        console.error('Initialization error:', error);
    }
}); 