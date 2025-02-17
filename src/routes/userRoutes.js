const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
    try {
        console.log('Получен запрос на данные пользователя. ID:', req.user.userId);

        // Ищем пользователя по id как строке
        const user = await User.findOne({ id: req.user.userId.toString() });
        
        if (!user) {
            console.log('Пользователь не найден');
            return res.status(404).json({ 
                error: 'Пользователь не найден',
                requestedId: req.user.userId
            });
        }

        console.log('Найденный пользователь:', user);

        res.json({
            userId: user.id,
            fullname: user.fullname
        });
    } catch (err) {
        console.error('Ошибка получения данных пользователя:', err);
        res.status(500).json({ 
            error: 'Внутренняя ошибка сервера',
            details: err.message
        });
    }
});

module.exports = router;
