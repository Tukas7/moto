document.addEventListener('DOMContentLoaded', function() {
    loadComponent('header-container', '/components/header.html');
    loadComponent('footer-container', '/components/footer.html');
});
function loadComponent(id, filePath, callback) {
    const container = document.getElementById(id);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', filePath, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            container.innerHTML = xhr.responseText;
            if (callback) {
                callback();
            }
        }
    };
    xhr.send();
}

function initializeHeaderEvents() {
    const loginButton = document.getElementById('loginButton');
    const signupButton = document.getElementById('signupButton');
    const profileButton = document.getElementById('profileButton');
    const cartButton = document.getElementById('cartButton');
    const adminLink = document.getElementById('adminLink'); // Ссылка на админку

    loginButton.addEventListener('click', function() {
        document.getElementById('loginModal').style.display = 'block';
    });

    signupButton.addEventListener('click', function() {
        document.getElementById('registerModal').style.display = 'block';
    });

    // Проверка авторизации и отображение соответствующих кнопок
    fetch('/auth/status')
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                loginButton.style.display = 'none';
                signupButton.style.display = 'none';
                profileButton.style.display = 'inline-block';
                cartButton.style.display = 'inline-block';
                if (data.isAdmin) {
                    adminLink.style.display = 'inline-block'; // Показать ссылку на админку
                } else {
                    adminLink.style.display = 'none'; // Скрыть ссылку на админку
                }
            } else {
                loginButton.style.display = 'inline-block';
                signupButton.style.display = 'inline-block';
                profileButton.style.display = 'none';
                cartButton.style.display = 'none';
                adminLink.style.display = 'none'; // Скрыть ссылку на админку
            }
        })
        .catch(error => console.error('Ошибка:', error));
}

function initializeLoginEvents() {
    const closeLoginModal = document.getElementById('closeLoginModal');
    const loginModal = document.getElementById('loginModal');

    closeLoginModal.addEventListener('click', function() {
        loginModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });

    document.getElementById('loginForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                alert('Успешный вход');
                loginModal.style.display = 'none';
                // Обновите состояние интерфейса после входа
                initializeHeaderEvents();
            } else {
                alert('Неправильное имя пользователя или пароль');
            }
        } catch (error) {
            console.error('Ошибка:', error);
        }
    });
}

function initializeRegisterEvents() {
    const closeRegisterModal = document.getElementById('closeRegisterModal');
    const registerModal = document.getElementById('registerModal');

    closeRegisterModal.addEventListener('click', function() {
        registerModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === registerModal) {
            registerModal.style.display = 'none';
        }
    });

    document.addEventListener('DOMContentLoaded', function () {
        const registerForm = document.getElementById('registerForm');
    
        registerForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const formData = new FormData(registerForm);
    
            try {
                const response = await fetch('/auth/register', {
                    method: 'POST',
                    body: formData
                });
    
                if (response.ok) {
                    alert('Регистрация прошла успешно');
                    
                } else {
                    const errorData = await response.json();
                    alert(errorData.error || 'Ошибка регистрации');
                }
            } catch (error) {
                console.error('Ошибка регистрации:', error);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    loadComponent('header-container', '/components/header.html', initializeHeaderEvents);
    loadComponent('footer-container', '/components/footer.html');
    loadComponent('loginModal-container', '/components/login.html', initializeLoginEvents);
    loadComponent('registerModal-container', '/components/register.html', initializeRegisterEvents);
});
