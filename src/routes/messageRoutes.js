const express = require('express');
const Message = require('../models/message.model');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.get('/:chatId', authenticateToken, async (req, res) => {
    try {
        const messages = await Message.find({ 
            chatId: req.params.chatId 
        }).sort({ createdAt: 1 });
        
        console.log('Retrieved messages:', messages);
        res.json(messages);
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { chatId, content, imageUrl } = req.body;
        
        if (!chatId || (!content && !imageUrl)) {
            return res.status(400).json({ error: 'Необходимо указать chatId и content или imageUrl' });
        }

        const newMessage = new Message({
            chatId,
            senderId: req.user.userId,
            content,
            imageUrl
        });

        await newMessage.save();
        
        // Используем глобальный io
        if (global.io) {
            global.io.to(chatId).emit('new_message', newMessage);
        }
        
        res.status(201).json(newMessage);
        
    } catch (err) {
        console.error('Ошибка создания сообщения:', err);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

module.exports = router;
