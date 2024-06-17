document.addEventListener('DOMContentLoaded', function() {
    const cartItems = document.getElementById('cartItems');
    const checkoutButton = document.getElementById('checkoutButton');
    const cartTotal = document.getElementById('cartTotal');

    async function loadCart() {
        try {
            const response = await fetch('/api/cart');
            if (!response.ok) throw new Error('Ошибка загрузки корзины');
            const cartItems = await response.json();
            cartList.innerHTML = '';
            cartItems.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <img src="data:image/jpeg;base64,${item.image ? arrayBufferToBase64(item.image.data) : ''}" alt="${item.name}">
                    <div class="cart-details">
                        <h3>${item.name}</h3>
                        <p>${item.description}</p>
                        <p>Цена: ${item.price} руб.</p>
                        <input type="number" value="${item.quantity}" min="1" onchange="updateCart(${item.id}, this.value)">
                        <button onclick="removeFromCart(${item.id})">Удалить</button>
                    </div>
                `;
                cartList.appendChild(cartItem);
            });
        } catch (error) {
            console.error('Ошибка загрузки корзины:', error);
        }
    }

    
    window.updateCart = async function(productId, quantity) {
        try {
            const response = await fetch('/api/cart/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId, quantity })
            });

            if (!response.ok) throw new Error('Ошибка обновления количества товара в корзине');
            alert('Количество товара обновлено');
            loadCart();
        } catch (error) {
            console.error('Ошибка обновления количества товара в корзине:', error);
        }
    }

    window.removeFromCart = async function(productId) {
        try {
            const response = await fetch('/api/cart/remove', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId })
            });

            if (!response.ok) throw new Error('Ошибка удаления товара из корзины');
            alert('Товар удален из корзины');
            loadCart();
        } catch (error) {
            console.error('Ошибка удаления товара из корзины:', error);
        }
    }
    checkoutButton.onclick = async function () {
        try {
            const response = await fetch('/api/cart/checkout', {
                method: 'POST'
            });

            if (!response.ok) throw new Error('Ошибка оформления заказа');
            alert('Заказ успешно оформлен');
            loadCart();
        } catch (error) {
            console.error('Ошибка оформления заказа:', error);
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
    checkoutButton.onclick = async function () {
        window.location.href = '/checkout';
    }

    loadCart();
});
