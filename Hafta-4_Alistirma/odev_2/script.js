//  selector
const appendLocation = '.ins-api-users'; 
function initApp() {
    
    const container = document.querySelector(appendLocation);
    if (!container) {
        console.error(`Selector "${appendLocation}" ile eşleşen element bulunamadı.`);
        return;
    }

    const style = document.createElement('style');
    style.textContent = `
        ${appendLocation} {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f7f9fc;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
        .app-header {
            text-align: center;
            margin-bottom: 30px;
            color: #2c3e50;
            padding-bottom: 15px;
            border-bottom: 2px solid #eaedf2;
        }
        .app-header h1 {
            margin: 0;
            font-size: 28px;
        }
        .user-card {
            border: 1px solid #eaedf2;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
            background-color: #ffffff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .user-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        .user-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .user-name {
            font-size: 18px;
            font-weight: 600;
            color: #2c3e50;
        }
        .user-email {
            color: #7f8c8d;
            margin-bottom: 10px;
        }
        .user-address {
            margin-top: 10px;
            font-size: 14px;
            color: #34495e;
            line-height: 1.4;
            background-color: #f8f9fa;
            padding: 8px 12px;
            border-radius: 6px;
        }
        .delete-btn {
            background-color: #e74c3c;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 6px 12px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s ease;
        }
        .delete-btn:hover {
            background-color: #c0392b;
        }
        .reload-btn {
            background-color: #3498db;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 10px 20px;
            cursor: pointer;
            font-size: 15px;
            font-weight: 500;
            margin: 20px auto;
            display: none; /* Başlangıçta gizli */
            transition: background-color 0.2s ease;
            display: block;
            width: 180px;
            text-align: center;
        }
        .reload-btn:hover {
            background-color: #2980b9;
        }
        .reload-btn.disabled {
            background-color: #bdc3c7;
            cursor: not-allowed;
        }
        .error-message {
            color: #e74c3c;
            padding: 15px;
            background-color: #ffeaea;
            border-radius: 6px;
            margin-bottom: 20px;
            font-size: 15px;
            border-left: 4px solid #e74c3c;
        }
        .empty-message {
            text-align: center;
            padding: 30px;
            color: #7f8c8d;
            font-size: 16px;
        }
    `;
    document.head.appendChild(style);

    const header = document.createElement('div');
    header.className = 'app-header';
    header.innerHTML = '<h1>User Management</h1>';

    const reloadBtn = document.createElement('button');
    reloadBtn.className = 'reload-btn';
    reloadBtn.textContent = 'Kullanıcıları Yükle';
    reloadBtn.addEventListener('click', function () {
        
        if (sessionStorage.getItem('reloadButtonUsed')) {
            reloadBtn.classList.add('disabled');
            reloadBtn.textContent = 'Bu oturumda tekrar kullanılamaz';
            return;
        }
        
        sessionStorage.setItem('reloadButtonUsed', 'true');
        
       
        localStorage.removeItem('users');
        fetchUsers();
        reloadBtn.style.display = 'none'; 
    });

    container.appendChild(header);
    container.appendChild(reloadBtn);

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                const userCards = container.querySelectorAll('.user-card');
                if (userCards.length === 0) {
                    reloadBtn.style.display = 'block';
                } else {
                    reloadBtn.style.display = 'none';
                }
            }
        });
    });

    observer.observe(container, { childList: true, subtree: true });

    function isStorageExpired() {
        const usersData = localStorage.getItem('users');
        if (!usersData) return true;
        
        try {
            const parsedData = JSON.parse(usersData);
            if (!parsedData.timestamp) return true;
            
            const storedTime = parseInt(parsedData.timestamp, 10);
            const currentTime = new Date().getTime();
            return (currentTime - storedTime) > 24 * 60 * 60 * 1000;
        } catch (e) {
            console.error('localStorage verileri parse edilemedi:', e);
            return true;
        }
    }

    function saveUsersToStorage(users) {
        const userData = {
            userData: users,
            timestamp: new Date().getTime()
        };
        localStorage.setItem('users', JSON.stringify(userData));
    }

    function getUsersFromStorage() {
        const usersJson = localStorage.getItem('users');
        if (!usersJson) return null;
        
        try {
            const parsedData = JSON.parse(usersJson);
            return parsedData.userData || null;
        } catch (e) {
            console.error('localStorage verileri parse edilemedi:', e);
            return null;
        }
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
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'Kullanıcı bulunamadı.';
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
            deleteBtn.textContent = 'Sil';
            deleteBtn.addEventListener('click', () => {
                deleteUser(user.id);
            });

            userHeader.appendChild(userName);
            userHeader.appendChild(deleteBtn);

            const userEmail = document.createElement('div');
            userEmail.className = 'user-email';
            userEmail.textContent = user.email;

            const userAddress = document.createElement('div');
            userAddress.className = 'user-address';
            userAddress.innerHTML = `<strong>Adres:</strong> ${user.address.street}, ${user.address.suite}, ${user.address.city}, ${user.address.zipcode}`;

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
                        reject('API yanıtı başarısız oldu');
                    }
                    return response.json();
                })
                .then(data => resolve(data))
                .catch(error => reject('Kullanıcılar getirilemedi: ' + error));
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
                container.appendChild(errorMessage);
            });
    }

    function init() {
        if (isStorageExpired()) {
            localStorage.removeItem('users');
            fetchUsers();
        } else {
            const storedUsers = getUsersFromStorage();
            renderUsers(storedUsers);
        }
    }

    init();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}