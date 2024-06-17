document.addEventListener('DOMContentLoaded', function () {
    async function loadProfile() {
        try {
            const response = await fetch('/auth/profile');
            if (!response.ok) throw new Error('Ошибка загрузки данных профиля');
            const profile = await response.json();

            document.getElementById('profileUsername').textContent = profile.username;
            document.getElementById('profileFirstName').value = profile.first_name;
            document.getElementById('profileLastName').value = profile.last_name;
            document.getElementById('profilePhoneNumber').value = profile.phone_number;
            document.getElementById('profileEmail').value = profile.email;
        } catch (error) {
            console.error('Ошибка загрузки данных профиля:', error);
        }
    }

    async function loadOrders() {
        try {
            const response = await fetch('/auth/orders');
            if (!response.ok) throw new Error('Ошибка загрузки заказов');
            const orders = await response.json();

            const orderList = document.getElementById('orderList');
            orderList.innerHTML = '';
            orders.forEach(order => {
                const orderItem = document.createElement('div');
                orderItem.className = 'order-item';
                orderItem.innerHTML = `
                    <h3>Заказ #${order.id}</h3>
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
                `;
                orderList.appendChild(orderItem);
            });
        } catch (error) {
            console.error('Ошибка загрузки заказов:', error);
        }
    }

    document.getElementById('profileForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        try {
            const response = await fetch('/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });

            if (response.ok) {
                alert('Профиль обновлен успешно');
                loadProfile();
            } else {
                alert('Ошибка обновления профиля');
            }
        } catch (error) {
            console.error('Ошибка обновления профиля:', error);
        }
    });

    document.getElementById('logoutButton').addEventListener('click', async function () {
        try {
            const response = await fetch('/auth/logout', {
                method: 'POST'
            });

            if (response.ok) {
                alert('Вы успешно вышли из аккаунта');
                window.location.href = '/';
            } else {
                alert('Ошибка выхода из аккаунта');
            }
        } catch (error) {
            console.error('Ошибка выхода из аккаунта:', error);
        }
    });

    loadProfile();
    loadOrders();
});
