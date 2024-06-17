document.addEventListener('DOMContentLoaded', function () {
    const reviewModal = document.getElementById('reviewModal');
    const loginPromptModal = document.getElementById('loginPromptModal');
    const closeReviewModal = document.getElementById('closeReviewModal');
    const closeLoginPromptModal = document.getElementById('closeLoginPromptModal');
    const reviewForm = document.getElementById('reviewForm');
    const reviewsList = document.getElementById('reviewsList').querySelector('.swiper-wrapper');
    const productList = document.getElementById('productList');
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const profileLink = document.getElementById('profileLink');
    const logoutLink = document.getElementById('logoutLink');
    const leaveReviewButton = document.getElementById('leaveReviewButton');
    let isAuthenticated = false;

    closeReviewModal.onclick = function () {
        reviewModal.style.display = 'none';
    }

    closeLoginPromptModal.onclick = function () {
        loginPromptModal.style.display = 'none';
    }

    window.onclick = function (event) {
        if (event.target == reviewModal) {
            reviewModal.style.display = 'none';
        } else if (event.target == loginPromptModal) {
            loginPromptModal.style.display = 'none';
        }
    }

    async function checkAuth() {
        try {
            const response = await fetch('/api/check-auth');
            if (response.ok) {
                const user = await response.json();
                isAuthenticated = user.authenticated;
                if (user.authenticated) {
                    if (loginLink) loginLink.style.display = 'none';
                    if (registerLink) registerLink.style.display = 'none';
                    if (profileLink) profileLink.style.display = 'block';
                    if (logoutLink) logoutLink.style.display = 'block';
                }
            }
        } catch (error) {
            console.error('Ошибка проверки аутентификации:', error);
        }
    }

    

    async function loadReviews() {
        try {
            const response = await fetch('/api/reviews');
            if (!response.ok) throw new Error('Ошибка загрузки отзывов');
            const reviews = await response.json();
            reviewsList.innerHTML = '';
            reviews.forEach(review => {
                const reviewItem = document.createElement('div');
                reviewItem.className = 'swiper-slide review-item';
                reviewItem.innerHTML = `
                    <img src="/images/default-avatar.jpg" alt="Аватар">
                    <h3>${review.user_name}</h3>
                    <p>${review.text}</p>
                `;
                reviewsList.appendChild(reviewItem);
            });

            // Инициализация Swiper.js
            new Swiper('.swiper-container', {
                loop: true,
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
            });
        } catch (error) {
            console.error('Ошибка загрузки отзывов:', error);
        }
    }

    reviewForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const formData = new FormData(reviewForm);

        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('Ваш отзыв отправлен на модерацию');
                reviewModal.style.display = 'none';
                reviewForm.reset();
            } else {
                alert('Ошибка отправки отзыва');
            }
        } catch (error) {
            console.error('Ошибка отправки отзыва:', error);
        }
    });

    function arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    window.openReviewModal = function () {
        if (isAuthenticated) {
            reviewModal.style.display = 'block';
        } else {
            loginPromptModal.style.display = 'block';
        }
    }

    leaveReviewButton.onclick = openReviewModal;

    checkAuth();
    
    loadReviews();
});
document.addEventListener('DOMContentLoaded', function () {
    const popularProductList = document.getElementById('popularProductList');

    function arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    async function loadPopularProducts() {
        try {
            const response = await fetch('/api/products?popular=true');
            if (!response.ok) throw new Error('Ошибка загрузки популярных товаров');
            const products = await response.json();
            popularProductList.innerHTML = '';
            products.forEach(product => {
                const productItem = document.createElement('div');
                productItem.className = 'product-item';
                productItem.innerHTML = `
                    <img src="data:image/jpeg;base64,${product.image ? arrayBufferToBase64(product.image.data) : ''}" alt="${product.name}">
                    <div class="product-details">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <p>Цена: ${product.price} руб.</p>
                        <button onclick="showProductDetails(${product.id})">Подробнее</button>
                        <button onclick="addToCart(${product.id})">Добавить в корзину</button>
                    </div>
                    </div>
                `;
                popularProductList.appendChild(productItem);
            });
        } catch (error) {
            console.error('Ошибка загрузки популярных товаров:', error);
        }
    }
    window.showProductDetails = function(productId) {
        fetch(`/api/products/${productId}`)
        
            .then(response => response.json())
            .then(product => {
                productDetails.innerHTML = `
                    <img class="Modalimg" src="data:image/jpeg;base64,${product.image ? arrayBufferToBase64(product.image.data) : ''}" alt="${product.name}">
                    <h2>${product.name}</h2>
                    <p>${product.description}</p>
                    <p>Цена: ${product.price} руб.</p>
                    <p>Бренд: ${product.brand_name}</p>
                    <p>Год модели: ${product.model_year}</p>
                    <p>Тип двигателя: ${product.engine_type}</p>
                    <p>Объем двигателя: ${product.engine_capacity} см³</p>
                    <p>Лошадиные силы: ${product.horsepower}</p>
                    <p>Крутящий момент: ${product.torque} Нм</p>
                    <p>Тип топлива: ${product.fuel_type}</p>
                    <p>Вес: ${product.weight} кг</p>
                    <p>Максимальная скорость: ${product.top_speed} км/ч</p>
                    <p>Время разгона (0-100 км/ч): ${product.acceleration_time} сек</p>
                    <p>Количество на складе: ${product.stock_quantity}</p>
                `;
                productModal.style.display = 'block';
            })
            
            .catch(error => console.error('Ошибка загрузки данных о товаре:', error));
            
    }
    window.addToCart = async function(productId) {
        try {
            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId, quantity: 1 })
            });

            if (response.status === 401) {
                document.getElementById('loginModal').style.display = 'block';
            } else if (!response.ok) {
                throw new Error('Ошибка добавления товара в корзину');
            } else {
                alert('Товар добавлен в корзину');
            }
        } catch (error) {
            console.error('Ошибка добавления товара в корзину:', error);
        }
    }
        // Закрытие модального окна
        document.getElementById('closeProductModal').onclick = function () {
            document.getElementById('productModal').style.display = 'none';
        }

        window.onclick = function (event) {
            const productModal = document.getElementById('productModal');
            if (event.target == productModal) {
                productModal.style.display = 'none';
            }
        }


    loadPopularProducts();
});