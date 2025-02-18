let selectedUser = null;

export const USERS_LIST = [
    {
        id: "50",
        fullname: "Иванов Сергей Васильевич",
        email: "ivanov@mail.ru"
    },
    {
        id: "51",
        fullname: "Алексеев Петр Александрович",
        email: "alekseev@mail.ru"
    },
    {
        id: "52",
        fullname: "Дюма Анатолий Артемович",
        email: "duma@mail.ru"
    }
];

export const getUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

export const displayUsers = (users) => {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';
    users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.className = 'user-item';
        userElement.textContent = user.fullname;
        userElement.onclick = () => {
            document.querySelectorAll('.user-item').forEach(el => 
                el.classList.remove('selected')
            );
            userElement.classList.add('selected');
            selectedUser = user;
            document.getElementById('confirmUserSelect').disabled = false;
        };
        usersList.appendChild(userElement);
    });
};

export const getSelectedUser = () => selectedUser;
export const setSelectedUser = (user) => {
    selectedUser = user;
}; 