const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const axios = require('axios');
const User = require('./User');

const app = express();
app.use(express.json());
app.use(cors());

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/animehub', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB подключён'))
.catch(err => console.error('Ошибка MongoDB:', err));

// JWT секрет
const JWT_SECRET = 'ваш_секретный_ключ';

// Регистрация пользователя
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'Пользователь создан' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Авторизация пользователя
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Неверный пароль' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение данных пользователя (защищённый роут)
app.get('/api/user', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Токен отсутствует' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение аниме из Jikan API
app.get('/api/anime/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`https://api.jikan.moe/v4/anime/${id}`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении аниме' });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));
