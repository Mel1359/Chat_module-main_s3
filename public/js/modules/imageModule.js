import { setCurrentAttachment } from './messageModule.js';

export const initializeImageUpload = () => {
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
                setCurrentAttachment(data.url);
                previewImage.src = data.url;
                previewInfo.textContent = `Прикреплен файл: ${file.name}`;
                preview.style.display = 'flex';

            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Ошибка загрузки изображения. Пожалуйста, попробуйте еще раз.');
                imageUpload.value = '';
                setCurrentAttachment(null);
                preview.style.display = 'none';
            }
        }
    });

    removeButton.onclick = () => {
        preview.style.display = 'none';
        imageUpload.value = '';
        setCurrentAttachment(null);
        previewInfo.textContent = '';
    };
}; 