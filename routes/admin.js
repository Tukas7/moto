const express = require('express');
const pool = require('../db/config');
const path = require('path');
const multer = require('multer'); // Модуль для загрузки файлов
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware для проверки авторизации админа
function checkAdmin(req, res, next) {
    if (req.session.userId && req.session.isAdmin) {
        next();
    } else {
        res.status(403).send('Доступ запрещен');
    }
}

// Маршрут для админской панели
router.get('/', checkAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '../views/admin.html'));
});

// Маршрут для получения всех товаров
router.get('/products', checkAdmin, async (req, res) => {
    const { brandId, engineTypeId, fuelTypeId, popular } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (brandId) {
        query += ' AND brand_id = $' + (params.length + 1);
        params.push(brandId);
    }
    if (engineTypeId) {
        query += ' AND engine_type_id = $' + (params.length + 1);
        params.push(engineTypeId);
    }
    if (fuelTypeId) {
        query += ' AND fuel_type_id = $' + (params.length + 1);
        params.push(fuelTypeId);
    }
    if (popular) {
        query += ' AND is_popular = true';
    }

    try {
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка загрузки товаров' });
    }
});

// Маршрут для получения товара по ID
router.get('/products/:id', checkAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const productQuery = `
            SELECT p.*, b.name as brand_name, e.type as engine_type, f.type as fuel_type
            FROM products p
            LEFT JOIN brands b ON p.brand_id = b.id
            LEFT JOIN engine_types e ON p.engine_type_id = e.id
            LEFT JOIN fuel_types f ON p.fuel_type_id = f.id
            WHERE p.id = $1
        `;
        const productResult = await pool.query(productQuery, [id]);

        if (productResult.rows.length === 0) {
            return res.status(404).send('Товар не найден');
        }

        const product = productResult.rows[0];
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }
});
router.post('/products', checkAdmin, upload.single('image'), async (req, res) => {
    console.log(req.body);
    const {
        name, description, price, brand_id, modelYear, engine_type_id, engineCapacity,
        horsepower, torque, fuel_type_id, weight, topSpeed, accelerationTime, stockQuantity, is_popular
    } = req.body;
    const image = req.file ? req.file.buffer : null;

    try {
        const result = await pool.query(
            `INSERT INTO products (
                name, description, price, brand_id, model_year, engine_type_id, engine_capacity,
                horsepower, torque, fuel_type_id, weight, top_speed, acceleration_time, stock_quantity, image, is_popular
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
            ) RETURNING *`,
            [
                name, description, price, brand_id, modelYear, engine_type_id, engineCapacity,
                horsepower, torque, fuel_type_id, weight, topSpeed, accelerationTime, stockQuantity, image, is_popular
            ]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка при добавлении продукта:', error);
        res.status(500).json({ error: 'Ошибка при добавлении продукта' });
    }
});

// Маршрут для редактирования товара
router.put('/editproduct/:id', checkAdmin, upload.single('image'), async (req, res) => {
    const { id } = req.params;
    
    const {
        name, description, price, brand, modelYear, engineType, engineCapacity,
        horsepower, torque, fuelType, weight, topSpeed, accelerationTime, stockQuantity, is_popular
    } = req.body;
    console.log('12', name, description, price, brand, modelYear, engineType, engineCapacity,
        horsepower, torque, fuelType, weight, topSpeed, accelerationTime, stockQuantity, is_popular);
    const image = req.file ? req.file.buffer : null;

    try {
        const result = await pool.query(
            `UPDATE products SET
                name = $1, description = $2, price = $3, brand_id = $4, model_year = $5,
                engine_type_id = $6, engine_capacity = $7, horsepower = $8, torque = $9,
                fuel_type_id = $10, weight = $11, top_speed = $12, acceleration_time = $13,
                stock_quantity = $14, image = COALESCE($15, image), is_popular = $16
            WHERE id = $17 RETURNING *`,
            [
                name, description, price, brand, modelYear, engineType, engineCapacity,
                horsepower, torque, fuelType, weight, topSpeed, accelerationTime, stockQuantity,
                image, is_popular, id
            ]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка редактирования товара:', error);
        res.status(500).json({ error: 'Ошибка редактирования товара' });
    }
});

// Маршрут для удаления товара
router.delete('/products/:id', checkAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM products WHERE id = $1', [id]);
        res.status(200).send('Товар удален');
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

// Маршрут для получения всех заказов
router.get('/orders', checkAdmin, async (req, res) => {
    try {
        const ordersResult = await pool.query(`
            SELECT o.id, o.user_id, o.total_price, o.address, o.payment_method, o.status, o.order_date, u.username
            FROM orders o
            JOIN users u ON o.user_id = u.id
        `);
        const orders = ordersResult.rows;

        for (const order of orders) {
            const orderItemsResult = await pool.query(`
                SELECT p.name, p.price, oi.quantity
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = $1
            `, [order.id]);
            order.items = orderItemsResult.rows;
        }

        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

// Маршрут для изменения статуса заказа
router.put('/orders/:id', checkAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const result = await pool.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

// Маршрут для удаления заказа
router.delete('/orders/:id', checkAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM orders WHERE id = $1', [id]);
        res.status(200).send('Заказ удален');
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

// Маршрут для получения всех отзывов (для модерации)
router.get('/reviews', checkAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT reviews.id, users.username as user_id, text FROM reviews JOIN users ON reviews.user_id = users.id WHERE approved = false');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

// Маршрут для одобрения отзыва
router.post('/reviews/:id/approve', checkAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE reviews SET approved = true WHERE id = $1', [id]);
        res.status(200).send('Отзыв одобрен');
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

// Маршрут для удаления отзыва
router.delete('/reviews/:id', checkAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
        res.status(200).send('Отзыв удален');
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

router.get('/engine-types', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM engine_types');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка загрузки типов двигателей' });
    }
});

router.get('/fuel-types', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM fuel_types');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка загрузки типов топлива' });
    }
});

router.get('/brands', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM brands');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка загрузки брендов' });
    }
});

router.post('/reviews', async (req, res) => {
    const { user_name, text } = req.body;
    try {
        const result = await pool.query('INSERT INTO reviews (user_name, text) VALUES ($1, $2) RETURNING *', [user_name, text]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка добавления отзыва' });
    }
});


router.get('/orders/completed-stats', checkAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DATE_TRUNC('month', order_date) AS month, COUNT(*) AS total_orders, SUM(total_price) AS total_sales
            FROM orders
            WHERE status = 'Завершен'
            GROUP BY month
            ORDER BY month
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

module.exports = router;
