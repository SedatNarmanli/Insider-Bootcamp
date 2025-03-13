document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector('.ins-api-users');

    // CSS ekleme
    const style = document.createElement('style');
    style.textContent = `
        .ins-api-users {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .user-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            background-color: #f9f9f9;
        }
        .user-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .user-name {
            font-size: 18px;
            font-weight: bold;
        }
        .user-email {
            color: #666;
        }
        .user-address {
            margin-top: 10px;
            font-size: 14px;
        }
        .delete-btn {
            background-color: #ff4d4d;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 5px 10px;
            cursor: pointer;
        }
        .delete-btn:hover {
            background-color: #ff0000;
        }
        .reload-btn {
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 10px 15px;
            cursor: pointer;
            margin-top: 15px;
            display: none; /* Başlangıçta gizli */
        }
        .reload-btn:hover {
            background-color: #0056b3;
        }
        .error-message {
            color: #ff0000;
            padding: 15px;
            background-color: #ffeeee;
            border-radius: 4px;
            margin-bottom: 15px;
        }
        .app-header {
            text-align: center;
            margin-bottom: 20px;
        }
    `;
    document.head.appendChild(style);

    // Başlık ve butonları oluştur
    const header = document.createElement('div');
    header.className = 'app-header';
    header.innerHTML = '<h1>User Management</h1>';

    const reloadBtn = document.createElement('button');
    reloadBtn.className = 'reload-btn';
    reloadBtn.textContent = 'Yeniden Yükle';
    reloadBtn.addEventListener('click', function () {
        localStorage.removeItem('users');
        localStorage.removeItem('usersTimestamp');
        fetchUsers();
        reloadBtn.style.display = 'none'; 
    });

    container.appendChild(header);
    container.appendChild(reloadBtn);

    function isStorageExpired() {
        const timestamp = localStorage.getItem('usersTimestamp');
        if (!timestamp) return true;
        const storedTime = parseInt(timestamp, 10);
        const currentTime = new Date().getTime();
        return (currentTime - storedTime) > 24 * 60 * 60 * 1000; // 1 gün
    }

    function saveUsersToStorage(users) {
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('usersTimestamp', new Date().getTime().toString());
    }

    function getUsersFromStorage() {
        const usersJson = localStorage.getItem('users');
        return usersJson ? JSON.parse(usersJson) : null;
    }

    function deleteUser(userId) {
        let users = getUsersFromStorage();
        if (users) {
            users = users.filter(user => user.id !== userId);
            saveUsersToStorage(users);
            renderUsers(users);
        }
    }

    function renderUsers(users) {
        container.innerHTML = '';
        container.appendChild(header);
        container.appendChild(reloadBtn);

        if (!users || users.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.textContent = 'No users available.';
            container.appendChild(emptyMessage);
            reloadBtn.style.display = 'block'; // Eğer kullanıcı yoksa butonu göster
            return;
        }

        users.forEach(user => {
            const userCard = document.createElement('div');
            userCard.className = 'user-card';

            const userHeader = document.createElement('div');
            userHeader.className = 'user-header';

            const userName = document.createElement('div');
            userName.className = 'user-name';
            userName.textContent = user.name;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => {
                deleteUser(user.id);
                if (getUsersFromStorage().length === 0) {
                    reloadBtn.style.display = 'block'; // Eğer hiç kullanıcı kalmadıysa butonu göster
                }
            });

            userHeader.appendChild(userName);
            userHeader.appendChild(deleteBtn);

            const userEmail = document.createElement('div');
            userEmail.className = 'user-email';
            userEmail.textContent = user.email;

            const userAddress = document.createElement('div');
            userAddress.className = 'user-address';
            userAddress.innerHTML = `<strong>Address:</strong> ${user.address.street}, ${user.address.suite}, ${user.address.city}, ${user.address.zipcode}`;

            userCard.appendChild(userHeader);
            userCard.appendChild(userEmail);
            userCard.appendChild(userAddress);

            container.appendChild(userCard);
        });
    }

    function getUsersFromAPI() {
        return new Promise((resolve, reject) => {
            fetch('https://jsonplaceholder.typicode.com/users')
                .then(response => {
                    if (!response.ok) {
                        reject('API response was not ok');
                    }
                    return response.json();
                })
                .then(data => resolve(data))
                .catch(error => reject('Failed to fetch users: ' + error));
        });
    }
    
    function fetchUsers() {
        getUsersFromAPI()
            .then(users => {
                saveUsersToStorage(users);
                renderUsers(users);
            })
            .catch(error => {
                console.error(error);
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.textContent = error;
                document.querySelector('.ins-api-users').appendChild(errorMessage);
            });
    }
    

    function init() {
        const storedUsers = getUsersFromStorage();
        if (storedUsers && !isStorageExpired()) {
            renderUsers(storedUsers);
        } else {
            localStorage.removeItem('users');
            localStorage.removeItem('usersTimestamp');
            fetchUsers();
        }
    }

    init();
});
