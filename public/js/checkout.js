document.addEventListener('DOMContentLoaded', function () {
    const checkoutForm = document.getElementById('checkoutForm');
    const regionSelect = document.getElementById('region');
    const citySelect = document.getElementById('city');

    const cityOptions = {
        'Тюменская область': ['Тюмень', 'Тобольск', 'Ишим'],
        'Московская область': ['Москва', 'Зеленоград', 'Подольск'],
        'Ленинградская область': ['Санкт-Петербург', 'Пушкин', 'Гатчина']
    };

    regionSelect.addEventListener('change', function () {
        const selectedRegion = regionSelect.value;
        const cities = cityOptions[selectedRegion];
        citySelect.innerHTML = '<option value="" disabled selected>Выберите город</option>';
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
        citySelect.disabled = false;
    });

    checkoutForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const formData = new FormData(checkoutForm);

        const data = {
            region: formData.get('region'),
            city: formData.get('city'),
            address: formData.get('address'),
            paymentMethod: formData.get('paymentMethod')
        };

        try {
            const response = await fetch('/api/cart/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Ошибка оформления заказа');
            const result = await response.json();
            alert('Заказ успешно оформлен');
            window.location.href = '/';
        } catch (error) {
            console.error('Ошибка оформления заказа:', error);
            alert('Ошибка оформления заказа');
        }
    });
});