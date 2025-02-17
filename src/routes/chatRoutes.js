const express = require('express');
const router = express.Router();
const Chat = require('../models/chat.model');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
    try {
        const currentUser = req.user.userId; // Получаем ID текущего пользователя из токена
        
        // Ищем все чаты, где текущий пользователь является участником
        const chats = await Chat.find({
            members: currentUser
        }).sort({ createdAt: -1 }); // Сортировка по дате создания (новые первые)
        
        res.json(chats);
    } catch (err) {
        console.error('Ошибка загрузки чатов:', err);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, members } = req.body;
        
        const existingChat = await Chat.findOne({
            members: { $all: members }
        });

        if (existingChat) {
            return res.status(200).json(existingChat);
        }
        
        const newChat = new Chat({
            name,
            members
        });

        await newChat.save();
        console.log('Создан новый чат:', newChat);
        
        res.status(201).json(newChat);
    } catch (err) {
        console.error('Ошибка создания чата:', err);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

module.exports = router; 