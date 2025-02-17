const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

loginForm.onsubmit = async (event) => {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            errorMessage.style.display = 'block';
            errorMessage.textContent = data.error || 'Ошибка входа';
            return;
        }

        localStorage.setItem('token', data.token);
        window.location.href = '/chats';
    } catch (err) {
        console.error('Ошибка:', err);
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'Произошла ошибка при входе';
    }
};
