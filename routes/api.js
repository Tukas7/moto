const express = require('express');
const path = require('path');
const pool = require('../db/config');
const multer = require('multer');
const upload = multer();

const router = express.Router();
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/catalog.html'));
});
// Проверка аутентификации
router.get('/check-auth', (req, res) => {
    if (req.session.userId) {
        res.json({ authenticated: true });
    } else {
        res.json({ authenticated: false });
    }
});

router.get('/products', async (req, res) => {
    console.log(req.query);
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

router.get('/products/:id', async (req, res) => {
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
            return res.status(404).json({ error: 'Продукт не найден' });
        }

        const product = productResult.rows[0];
        
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка загрузки товара' });
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

// Получение всех отзывов, только одобренных
router.get('/reviews', async (req, res) => {
    try {
        const result = await pool.query('SELECT reviews.id, users.first_name as user_name, text FROM reviews JOIN users ON reviews.user_id = users.id WHERE approved = true');
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка загрузки отзывов:', err);
        res.status(500).send('Ошибка сервера');
    }
});

// Добавление нового отзыва
router.post('/reviews', upload.none(), async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Вы не авторизованы');
    }

    const { review } = req.body;
    try {
        await pool.query(
            'INSERT INTO reviews (user_id, text, approved) VALUES ($1, $2, false)',
            [req.session.userId, review]
        );
        res.status(201).send('Отзыв отправлен на модерацию');
    } catch (err) {
        console.error('Ошибка добавления отзыва:', err);
        res.status(500).send('Ошибка сервера');
    }
});

module.exports = router;
