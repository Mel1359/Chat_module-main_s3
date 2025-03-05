const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Мок для AWS S3
jest.mock('aws-sdk', () => ({
    S3: jest.fn(() => ({
        listBuckets: jest.fn().mockImplementation(callback => {
            callback(null, { Buckets: [{ Name: 'test-bucket' }] });
        })
    }))
}));

// Мок для multer-s3
jest.mock('multer-s3', () => jest.fn(() => ({
    storageEngine: 'multer-s3-storage'
})));

// Мок для multer
jest.mock('multer', () => {
    const multerInstance = {
        single: jest.fn()
    };
    return jest.fn(() => multerInstance);
});

describe('S3 Configuration', () => {
    let consoleSpy;
    let s3Config;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Настройка переменных окружения
        process.env.AWS_ACCESS_KEY_ID = 'test-key';
        process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
        process.env.AWS_BUCKET_NAME = 'test-bucket';

        // Мок для console
        consoleSpy = {
            log: jest.spyOn(console, 'log').mockImplementation(),
            error: jest.spyOn(console, 'error').mockImplementation()
        };

        // Очищаем кэш модуля перед каждым тестом
        jest.resetModules();
        s3Config = require('./s3');
    });

    afterEach(() => {
        consoleSpy.log.mockRestore();
        consoleSpy.error.mockRestore();
    });

    test('инициализация S3 клиента с правильными параметрами', () => {
        expect(AWS.S3).toHaveBeenCalledWith({
            accessKeyId: 'test-key',
            secretAccessKey: 'test-secret',
            endpoint: 'https://s3.regru.cloud',
            bucket: 'test-bucket',
            s3ForcePathStyle: true,
            signatureVersion: 'v4',
            sslEnabled: true,
            httpOptions: {
                timeout: 10000,
                connectTimeout: 10000
            }
        });

        expect(consoleSpy.log).toHaveBeenCalledWith(
            'Успешное подключение к S3. Доступные бакеты:',
            [{ Name: 'test-bucket' }]
        );
    });

    test('проверка конфигурации multer', () => {
        const multerConfig = multer.mock.calls[0][0];
        
        expect(multerConfig).toMatchObject({
            limits: {
                fileSize: 5 * 1024 * 1024
            }
        });
        
        expect(multerS3).toHaveBeenCalled();
        expect(s3Config.upload).toBeDefined();
    });

    test('фильтр файлов пропускает только изображения', () => {
        const multerConfig = multer.mock.calls[0][0];
        const fileFilter = multerConfig.fileFilter;
        const callback = jest.fn();

        // Тест для изображения
        fileFilter(null, { mimetype: 'image/jpeg' }, callback);
        expect(callback).toHaveBeenLastCalledWith(null, true);

        // Тест для неизображения
        fileFilter(null, { mimetype: 'application/pdf' }, callback);
        expect(callback).toHaveBeenLastCalledWith(
            expect.objectContaining({
                message: 'Только изображения разрешены'
            }),
            false
        );
    });
}); 