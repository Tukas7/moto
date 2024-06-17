const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const apiRoutes = require('./routes/api');
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const cartRouter = require('./routes/cart');
const adminRouter = require('./routes/admin');


const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Настройка пути к статическим файлам
app.use(express.static(path.join(__dirname, 'public')));

// Настройка пути к файлам компонентов
app.use('/components', express.static(path.join(__dirname, 'components')));

// Подключение маршрутов
app.use('/', indexRouter);
app.use('/api', apiRoutes);
app.use('/auth', authRouter);
app.use('/admin', adminRouter);
app.use('/api/cart', cartRouter);
app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'checkout.html'));
});
app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'cart.html'));
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});
app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});

app.get('/faq', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'faq.html'));
});
app.get('/delivery', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'delivery.html'));
});
app.get('/contacts', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'contacts.html'));
});
app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});
