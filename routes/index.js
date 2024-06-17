const express = require('express');
const path = require('path');
const router = express.Router();
const pool = require('../db/config');

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views', 'index.html'));
});
// Маршрут для добавления отзыва
router.post('/reviews', async (req, res) => {
    const { user_id, product_id, content, rating } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO reviews (user_id, product_id, content, rating) VALUES ($1, $2, $3, $4) RETURNING id',
            [user_id, product_id, content, rating]
        );
        res.status(201).json({ reviewId: result.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

// Маршрут для получения отзывов
router.get('/reviews', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM reviews WHERE is_approved = TRUE');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

// Маршрут для получения отзывов для модерации
router.get('/reviews/moderation', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM reviews WHERE is_approved = FALSE');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

// Маршрут для одобрения отзыва
router.put('/reviews/:id/approve', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE reviews SET is_approved = TRUE WHERE id = $1', [id]);
        res.status(200).send('Отзыв одобрен');
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

module.exports = router;
