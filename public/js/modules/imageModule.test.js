import { initializeImageUpload } from './imageModule.js';
import { setCurrentAttachment } from './messageModule.js';

jest.mock('./messageModule.js');

describe('Image Module', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <input type="file" id="image-upload" />
            <div id="attachment-preview">
                <img id="preview-image" src="" />
                <div class="preview-info"><span></span></div>
                <button id="remove-attachment"></button>
            </div>
        `;
        localStorage.setItem('token', 'test-token');
        
        // Очищаем моки перед каждым тестом
        jest.clearAllMocks();
        
        // Настраиваем мок для fetch
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ url: 'test.jpg' })
        });
    });

    test('загрузка изображения', async () => {
        const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        
        initializeImageUpload();
        
        const imageUpload = document.getElementById('image-upload');
        Object.defineProperty(imageUpload, 'files', { value: [mockFile] });
        
        // Создаем и диспатчим событие change
        const changeEvent = new Event('change');
        imageUpload.dispatchEvent(changeEvent);
        
        // Ждем завершения асинхронных операций
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // Проверяем, что fetch был вызван с правильными параметрами
        expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
                'Authorization': 'Bearer test-token'
            }),
            body: expect.any(FormData)
        }));
        
        // Проверяем, что setCurrentAttachment был вызван с правильным URL
        expect(setCurrentAttachment).toHaveBeenCalledWith('test.jpg');
        
        // Проверяем, что превью обновилось
        expect(document.getElementById('preview-image').src).toContain('test.jpg');
        expect(document.getElementById('attachment-preview').style.display).toBe('flex');
    });

    test('удаление прикрепленного изображения', () => {
        initializeImageUpload();
        
        const preview = document.getElementById('attachment-preview');
        const removeButton = document.getElementById('remove-attachment');
        
        preview.style.display = 'flex';
        removeButton.click();
        
        expect(preview.style.display).toBe('none');
        expect(setCurrentAttachment).toHaveBeenCalledWith(null);
    });
}); 