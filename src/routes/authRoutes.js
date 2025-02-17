const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const authenticateToken = require('../middleware/auth');

router.post('/', async (req, res) => {
    console.log('Получен запрос на аутентификацию:', req.body);
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        console.log('Найденный пользователь:', user);
        
        if (!user || user.password !== password) {
            console.log('Неверные учетные данные');
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        const token = jwt.sign(
            { userId: user.id, fullname: user.fullname },
            process.env.JWT_SECRET,
            { expiresIn: '30m' }
        );

        console.log('Токен создан успешно');
        res.json({ token, fullname: user.fullname });
    } catch (err) {
        console.error('Ошибка аутентификации:', err);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

router.get('/verify', authenticateToken, (req, res) => {
    res.json({ valid: true });
});

module.exports = router;
