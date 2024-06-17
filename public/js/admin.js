document.addEventListener('DOMContentLoaded', function () {
    const productForm = document.getElementById('productForm');
    const productList = document.getElementById('productList');
    const statsCanvas = document.getElementById('statsCanvas').getContext('2d');
    const reviewList = document.getElementById('reviewList');
    const orderList = document.getElementById('orderList');
    const editProductModal = document.getElementById('editProductModal');
    const closeEditProductModal = document.getElementById('closeEditProductModal');
    const editProductForm = document.getElementById('editProductForm');
    const brandSelect = document.getElementById('editProductBrand');
    const engineTypeSelect = document.getElementById('editProductEngineType');
    const fuelTypeSelect = document.getElementById('editProductFuelType');
    const addBrandSelect = document.getElementById('productBrand');
    const addEngineTypeSelect = document.getElementById('productEngineType');
    const addFuelTypeSelect = document.getElementById('productFuelType');

    closeEditProductModal.onclick = function () {
        editProductModal.style.display = 'none';
    }

    window.onclick = function (event) {
        if (event.target == editProductModal) {
            editProductModal.style.display = 'none';
        }
    }

    function arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    async function loadProducts() {
        try {
            const response = await fetch('/admin/products');
            if (!response.ok) throw new Error('Ошибка загрузки товаров');
            const products = await response.json();
            productList.innerHTML = '';
            products.forEach(product => {
                const productItem = document.createElement('div');
                productItem.className = 'product-item';
                productItem.innerHTML = `
                    <img src="data:image/jpeg;base64,${product.image ? arrayBufferToBase64(product.image.data) : ''}" alt="${product.name}">
                    <div class="product-details">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <p>Цена: ${product.price} руб.</p>
                    </div>
                    <div class="buttons">
                        <button onclick="openEditProductModal(${product.id})">Редактировать</button>
                        <button onclick="deleteProduct(${product.id})">Удалить</button>
                    </div>
                `;
                productList.appendChild(productItem);
            });
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
        }
    }

    async function loadOrders() {
        try {
            const response = await fetch('/admin/orders');
            if (!response.ok) throw new Error('Ошибка загрузки заказов');
            const orders = await response.json();
            orderList.innerHTML = '';
            console.log(orders);
            orders.forEach(order => {
                const orderItem = document.createElement('div');
                orderItem.className = 'order-item';
                orderItem.innerHTML = `
                    <h3>Заказ #${order.id}</h3>
                    <p>Пользователь: ${order.username}</p>
                    <p>Дата заказа: ${new Date(order.order_date).toLocaleString()}</p>
                    <p>Товары:</p>
                    <ul>
                        ${order.items.map(item => `
                            <li>${item.name} - ${item.quantity} шт. по ${item.price} руб.</li>
                        `).join('')}
                    </ul>
                    <p>Итоговая сумма: ${order.total_price} руб.</p>
                    <p>Адрес: ${order.address}</p>
                    <p>Способ оплаты: ${order.payment_method}</p>
                    <p>Статус: ${order.status}</p>
                    <div class="buttons">
                        <select id="statusSelect-${order.id}" class="status-select">
                            <option value="Новый" ${order.status === 'Новый' ? 'selected' : ''}>Новый</option>
                            <option value="В процессе" ${order.status === 'В процессе' ? 'selected' : ''}>В процессе</option>
                            <option value="Завершен" ${order.status === 'Завершен' ? 'selected' : ''}>Завершен</option>
                        </select>
                        <button onclick="updateOrderStatus(${order.id})">Изменить статус</button>
                        <button onclick="deleteOrder(${order.id})">Удалить</button>
                    </div>
                `;
                orderList.appendChild(orderItem);
            });
        } catch (error) {
            console.error('Ошибка загрузки заказов:', error);
        }
    }

    window.updateOrderStatus = async function (id) {
        const statusSelect = document.getElementById(`statusSelect-${id}`);
        const status = statusSelect.value;
        try {
            const response = await fetch(`/admin/orders/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) throw new Error('Ошибка изменения статуса заказа');
            loadOrders();
        } catch (error) {
            console.error('Ошибка изменения статуса заказа:', error);
        }
    };

    window.deleteOrder = async function (id) {
        if (confirm('Вы уверены, что хотите удалить этот заказ?')) {
            try {
                const response = await fetch(`/admin/orders/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) throw new Error('Ошибка удаления заказа');
                loadOrders();
            } catch (error) {
                console.error('Ошибка удаления заказа:', error);
            }
        }
    };

    async function loadReviews() {
        try {
            const response = await fetch('/admin/reviews');
            if (!response.ok) throw new Error('Ошибка загрузки отзывов');
            const reviews = await response.json();
            reviewList.innerHTML = '';
            reviews.forEach(review => {
                const reviewItem = document.createElement('div');
                reviewItem.className = 'review-item';
                reviewItem.innerHTML = `
                    <h3>Пользователь: ${review.user_id}</h3>
                    <p>${review.text}</p>
                    <div class="buttons">
                        <button onclick="approveReview(${review.id})">Одобрить</button>
                        <button onclick="deleteReview(${review.id})">Удалить</button>
                    </div>
                `;
                reviewList.appendChild(reviewItem);
            });
        } catch (error) {
            console.error('Ошибка загрузки отзывов:', error);
        }
    }

    productForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const formData = new FormData(productForm);

        try {
            const response = await fetch('/admin/products', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('Товар успешно добавлен');
                loadProducts();
                productForm.reset();
            } else {
                alert('Ошибка добавления товара');
            }
        } catch (error) {
            console.error('Ошибка добавления товара:', error);
        }
    });

    async function fetchDropdownData() {
        await loadDropdown('/api/brands', brandSelect);
        await loadDropdown('/api/engine-types', engineTypeSelect);
        await loadDropdown('/api/fuel-types', fuelTypeSelect);

        await loadDropdown('/api/brands', addBrandSelect);
        await loadDropdown('/api/engine-types', addEngineTypeSelect);
        await loadDropdown('/api/fuel-types', addFuelTypeSelect);
    }

    async function loadDropdown(url, element) {
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                element.innerHTML = ''; // Очищаем текущие опции
                data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.id;
                    option.textContent = item.name || item.type;
                    element.appendChild(option);
                });
            })
            .catch(error => console.error('Ошибка загрузки данных:', error));
    }

    window.openEditProductModal = async function(productId) {
        try {
            const response = await fetch(`/api/products/${productId}`);
            if (!response.ok) throw new Error('Ошибка загрузки товара');
            const product = await response.json();

            document.getElementById('editProductName').value = product.name;
            document.getElementById('editProductDescription').value = product.description;
            document.getElementById('editProductPrice').value = product.price;
            document.getElementById('editProductModelYear').value = product.model_year;
            document.getElementById('editProductEngineCapacity').value = product.engine_capacity;
            document.getElementById('editProductHorsepower').value = product.horsepower;
            document.getElementById('editProductTorque').value = product.torque;
            document.getElementById('editProductWeight').value = product.weight;
            document.getElementById('editProductTopSpeed').value = product.top_speed;
            document.getElementById('editProductAccelerationTime').value = product.acceleration_time;
            document.getElementById('editStockQuantity').value = product.stock_quantity;

            // Устанавливаем значения в select
            brandSelect.value = product.brand_id;
            engineTypeSelect.value = product.engine_type_id;
            fuelTypeSelect.value = product.fuel_type_id;

            editProductModal.style.display = 'block';

            editProductForm.onsubmit = async function(event) {
                event.preventDefault();
                const formData = new FormData(editProductForm);

                try {
                    const response = await fetch(`/admin/editproduct/${productId}`, {
                        method: 'PUT',
                        body: formData
                    });

                    if (response.ok) {
                        alert('Товар успешно обновлен');
                        editProductModal.style.display = 'none';
                        loadProducts();
                    } else {
                        alert('Ошибка обновления товара');
                    }
                } catch (error) {
                    console.error('Ошибка обновления товара:', error);
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки товара:', error);
        }
    }

    window.deleteProduct = async function (id) {
        if (confirm('Вы уверены, что хотите удалить этот товар?')) {
            try {
                const response = await fetch(`/admin/products/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    alert('Товар успешно удален');
                    loadProducts();
                } else {
                    alert('Ошибка удаления товара');
                }
            } catch (error) {
                console.error('Ошибка удаления товара:', error);
            }
        }
    };

    window.approveReview = async function (id) {
        if (confirm('Вы уверены, что хотите одобрить этот отзыв?')) {
            try {
                const response = await fetch(`/admin/reviews/${id}/approve`, {
                    method: 'POST'
                });

                if (response.ok) {
                    alert('Отзыв успешно одобрен');
                    loadReviews();
                } else {
                    alert('Ошибка одобрения отзыва');
                }
            } catch (error) {
                console.error('Ошибка одобрения отзыва:', error);
            }
        }
    };

    window.deleteReview = async function (id) {
        if (confirm('Вы уверены, что хотите удалить этот отзыв?')) {
            try {
                const response = await fetch(`/admin/reviews/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    alert('Отзыв успешно удален');
                    loadReviews();
                } else {
                    alert('Ошибка удаления отзыва');
                }
            } catch (error) {
                console.error('Ошибка удаления отзыва:', error);
            }
        }
    };

    async function loadStats() {
        try {
            const response = await fetch('/admin/orders/completed-stats');
            if (!response.ok) throw new Error('Ошибка загрузки статистики');
            const stats = await response.json();

            const labels = stats.map(stat => new Date(stat.month).toLocaleString('ru', { month: 'long', year: 'numeric' }));
            const totalOrders = stats.map(stat => stat.total_orders);
            const totalSales = stats.map(stat => stat.total_sales);

            new Chart(statsCanvas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Количество продаж',
                            data: totalOrders,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Сумма продаж',
                            data: totalSales,
                            backgroundColor: 'rgba(153, 102, 255, 0.2)',
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
        }
    }
    loadStats();
    fetchDropdownData();
    loadProducts();
    loadOrders();
    loadReviews();
});
