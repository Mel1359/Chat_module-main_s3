const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config();

// Конфигурация для RegRu Object Storage
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: 'https://s3.regru.cloud',
    bucket: process.env.AWS_BUCKET_NAME,
    // Специфичные настройки для Yandex Cloud
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
    // Добавляем корректные заголовки
    sslEnabled: true,
    httpOptions: {
        timeout: 10000,
        connectTimeout: 10000
    }
});

// Проверка соединения с S3
s3.listBuckets((err, data) => {
    if (err) {
        console.error('Ошибка подключения к S3:', err);
    } else {
        console.log('Успешное подключение к S3. Доступные бакеты:', data.Buckets);
    }
});

// Настройка загрузки файлов
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const fileName = `uploads/${Date.now()}-${file.originalname}`;
            cb(null, fileName);
        }
    }),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB лимит
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Только изображения разрешены'), false);
        }
    }
});

module.exports = { s3, upload }; 