document.addEventListener('DOMContentLoaded', function() {
    const productCatalog = document.getElementById('productCatalog');
    const productModal = document.getElementById('productModal');
    const closeProductModal = document.getElementById('closeProductModal');
    const productDetails = document.getElementById('productDetails');
    const brandFilter = document.getElementById('brandFilter');
    const engineTypeFilter = document.getElementById('engineTypeFilter');
    const fuelTypeFilter = document.getElementById('fuelTypeFilter');

    closeProductModal.onclick = function() {
        productModal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == productModal) {
            productModal.style.display = 'none';
        }
    }

    async function fetchDropdownData() {
        await loadDropdown('/api/brands', brandFilter);
        await loadDropdown('/api/engine-types', engineTypeFilter);
        await loadDropdown('/api/fuel-types', fuelTypeFilter);
    }

    function loadDropdown(url, element) {
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.id;
                    option.textContent = item.name || item.type;
                    element.appendChild(option);
                });
            })
            .catch(error => console.error('Ошибка загрузки данных:', error));
    }

    async function loadProducts(filters = {}) {
        try {
            const params = new URLSearchParams(filters);
            const response = await fetch(`/api/products?${params}`);
            if (!response.ok) throw new Error('Ошибка загрузки товаров');
            const products = await response.json();
            productCatalog.innerHTML = '';
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
                        <button onclick="addToCart(${product.id})">В корзину</button>
                    </div>
                `;
                productCatalog.appendChild(productItem);
            });
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
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

    window.applyFilters = function() {
        const brandId = brandFilter.value;
        const engineTypeId = engineTypeFilter.value;
        const fuelTypeId = fuelTypeFilter.value;
        loadProducts({ brandId, engineTypeId, fuelTypeId });
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

    function arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    fetchDropdownData();
    loadProducts();
});
