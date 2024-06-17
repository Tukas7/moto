const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/config');
const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, password, first_name, last_name, phone_number, email } = req.body;

    try {
        // Проверка на уникальность имени пользователя
        const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Имя пользователя уже существует' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (username, password, first_name, last_name, phone_number, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [username, hashedPassword, first_name, last_name, phone_number, email]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка регистрации пользователя' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Имя пользователя и пароль обязательны');
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user.id;
            req.session.isAdmin = user.is_admin;
            res.status(200).json({ message: 'Успешный вход', isAdmin: user.is_admin });
        } else {
            res.status(400).send('Неправильное имя пользователя или пароль');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Ошибка сервера');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Ошибка выхода');
        }
        res.status(200).send('Успешный выход');
    });
});

router.get('/status', (req, res) => {
    if (req.session.userId) {
        res.json({ loggedIn: true, isAdmin: req.session.isAdmin });
    } else {
        res.json({ loggedIn: false });
    }
});
router.get('/profile', async (req, res) => {
    const userId = req.session.userId;

    try {
        const result = await pool.query('SELECT username, first_name, last_name, phone_number, email FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка получения данных пользователя' });
    }
});

router.put('/profile', async (req, res) => {
    const userId = req.session.userId;
    const { first_name, last_name, phone_number, email } = req.body;

    try {
        const result = await pool.query(
            'UPDATE users SET first_name = $1, last_name = $2, phone_number = $3, email = $4 WHERE id = $5 RETURNING *',
            [first_name, last_name, phone_number, email, userId]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка обновления данных пользователя' });
    }
});

// Маршрут для выхода из аккаунта
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка выхода из аккаунта' });
        }
        res.status(200).send('Вы вышли из аккаунта');
    });
});

// Маршрут для получения заказов пользователя
router.get('/orders', async (req, res) => {
    const userId = req.session.userId;

    try {
        const result = await pool.query(`
            SELECT o.id, o.total_price, o.address, o.payment_method, o.status, o.order_date
            FROM orders o
            WHERE o.user_id = $1
        `, [userId]);

        const orders = result.rows;

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
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка получения заказов пользователя' });
    }
});
module.exports = router;
