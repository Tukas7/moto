const express = require('express');
const router = express.Router();
const pool = require('../db/config');

// Middleware для проверки авторизации пользователя
function checkAuth(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Требуется авторизация' });
    }
}

// Маршрут для добавления товара в корзину
router.post('/add', checkAuth, async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.session.userId;

    try {
        await pool.query(
            'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity',
            [userId, productId, quantity]
        );
        res.status(200).json({ message: 'Товар добавлен в корзину' });
    } catch (error) {
        console.error('Ошибка добавления товара в корзину:', error);
        res.status(500).json({ error: 'Ошибка добавления товара в корзину' });
    }
});
router.put('/update', checkAuth, async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.session.userId;

    try {
        await pool.query(
            'UPDATE cart SET quantity = $1 WHERE user_id = $2 AND product_id = $3',
            [quantity, userId, productId]
        );
        res.status(200).json({ message: 'Количество товара обновлено' });
    } catch (error) {
        console.error('Ошибка обновления количества товара в корзине:', error);
        res.status(500).json({ error: 'Ошибка обновления количества товара в корзине' });
    }
});

// Маршрут для удаления товара из корзины
router.delete('/remove', checkAuth, async (req, res) => {
    const { productId } = req.body;
    const userId = req.session.userId;

    try {
        await pool.query(
            'DELETE FROM cart WHERE user_id = $1 AND product_id = $2',
            [userId, productId]
        );
        res.status(200).json({ message: 'Товар удален из корзины' });
    } catch (error) {
        console.error('Ошибка удаления товара из корзины:', error);
        res.status(500).json({ error: 'Ошибка удаления товара из корзины' });
    }
});
// Маршрут для получения товаров в корзине
router.get('/', checkAuth, async (req, res) => {
    const userId = req.session.userId;

    try {
        const result = await pool.query(
            'SELECT p.*, c.quantity FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = $1',
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка получения корзины:', error);
        res.status(500).json({ error: 'Ошибка получения корзины' });
    }
});
router.post('/checkout', checkAuth, async (req, res) => {
    const userId = req.session.userId;
    const { region, city, address, paymentMethod } = req.body;

    try {
        // Получение товаров из корзины пользователя
        const cartItemsResult = await pool.query('SELECT * FROM cart WHERE user_id = $1', [userId]);
        const cartItems = cartItemsResult.rows;

        if (cartItems.length === 0) {
            return res.status(400).json({ error: 'Корзина пуста' });
        }

        // Подсчет итоговой суммы
        let totalPrice = 0;
        for (const item of cartItems) {
            const productResult = await pool.query('SELECT price FROM products WHERE id = $1', [item.product_id]);
            const product = productResult.rows[0];
            totalPrice += product.price * item.quantity;
        }

        // Формирование полного адреса
        const fullAddress = `${region}, ${city}, ${address}`;

        // Вставка нового заказа в базу данных
        const newOrderResult = await pool.query(
            'INSERT INTO orders (user_id, total_price, address, payment_method, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, totalPrice, fullAddress, paymentMethod, 'Новый']
        );

        const orderId = newOrderResult.rows[0].id;

        for (const item of cartItems) {
            await pool.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, (SELECT price FROM products WHERE id = $2))',
                [orderId, item.product_id, item.quantity]
            );
        }

        // Очистка корзины пользователя
        await pool.query('DELETE FROM cart WHERE user_id = $1', [userId]);

        res.status(200).json({ message: 'Заказ успешно оформлен', orderId });
    } catch (error) {
        console.error('Ошибка оформления заказа:', error);
        res.status(500).json({ error: 'Ошибка оформления заказа' });
    }
});


module.exports = router;
