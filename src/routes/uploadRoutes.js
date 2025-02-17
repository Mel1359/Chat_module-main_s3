const express = require('express');
const router = express.Router();
const { upload } = require('../config/s3');
const authenticateToken = require('../middleware/auth');

router.post('/', authenticateToken, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Файл не загружен' });
        }

        res.json({
            url: req.file.location // S3 URL загруженного файла
        });
    } catch (error) {
        console.error('Ошибка загрузки файла:', error);
        res.status(500).json({ error: 'Ошибка загрузки файла' });
    }
});

module.exports = router; 