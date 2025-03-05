import { getUserId, displayUsers, getSelectedUser, setSelectedUser, USERS_LIST } from './userModule.js';

describe('User Module', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="usersList"></div>
            <button id="confirmUserSelect" disabled></button>
        `;
        localStorage.clear();
        setSelectedUser(null);
    });

    test('getUserId корректно декодирует токен', () => {
        const mockUserId = '123';
        const mockToken = `header.${btoa(JSON.stringify({ userId: mockUserId }))}.signature`;
        localStorage.setItem('token', mockToken);

        const userId = getUserId();
        expect(userId).toBe(mockUserId);
    });

    test('getUserId возвращает null при отсутствии токена', () => {
        const userId = getUserId();
        expect(userId).toBeNull();
    });

    test('displayUsers отображает список пользователей', () => {
        displayUsers(USERS_LIST);
        
        const usersList = document.getElementById('usersList');
        expect(usersList.children.length).toBe(USERS_LIST.length);
        expect(usersList.children[0].textContent).toBe(USERS_LIST[0].fullname);
    });

    test('выбор пользователя активирует кнопку подтверждения', () => {
        displayUsers(USERS_LIST);
        
        const firstUser = document.querySelector('.user-item');
        firstUser.click();
        
        expect(firstUser.classList.contains('selected')).toBeTruthy();
        expect(document.getElementById('confirmUserSelect').disabled).toBeFalsy();
        expect(getSelectedUser()).toEqual(USERS_LIST[0]);
    });

    test('setSelectedUser обновляет выбранного пользователя', () => {
        const testUser = USERS_LIST[1];
        setSelectedUser(testUser);
        
        expect(getSelectedUser()).toEqual(testUser);
    });

    test('повторный выбор пользователя снимает предыдущее выделение', () => {
        displayUsers(USERS_LIST);
        
        const userItems = document.querySelectorAll('.user-item');
        userItems[0].click();
        userItems[1].click();
        
        expect(userItems[0].classList.contains('selected')).toBeFalsy();
        expect(userItems[1].classList.contains('selected')).toBeTruthy();
        expect(getSelectedUser()).toEqual(USERS_LIST[1]);
    });
}); 