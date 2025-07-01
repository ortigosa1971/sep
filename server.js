
const express = require('express');
const session = require('express-session');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

const API_KEY = 'e19cf0d935fc49329cf0d935fc5932cc';
const STATION_ID = 'IALFAR30';

// Middleware CSP
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy",
    "default-src 'self'; " +
    "style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://www.gstatic.com; " +
    "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://translate.google.com https://www.gstatic.com;");
  next();
});

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sesión
app.use(session({
  secret: 'clave-secreta',
  resave: false,
  saveUninitialized: false
}));

// Ruta protegida
app.get('/', (req, res) => {
  if (!req.session.usuario) {
    return res.redirect('/login.html');
  }
  res.sendFile(path.join(__dirname, 'public', 'inicio.html'));
});

// Ruta para login
app.post('/login', (req, res) => {
  const { usuario } = req.body;
  if (usuario && usuario.trim() !== "") {
    req.session.usuario = usuario;
    return res.redirect('/');
  }
  res.redirect('/login.html');
});

// Ruta para logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});

// API del clima
app.get('/api/clima', async (req, res) => {
  try {
    const url = `https://api.weather.com/v2/pws/observations/current?stationId=${STATION_ID}&format=json&units=m&apiKey=${API_KEY}`;
    const respuesta = await axios.get(url);
    res.json(respuesta.data);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo obtener el clima' });
  }
});

// Fallback para 404
app.use((req, res) => {
  res.status(404).send('Página no encontrada');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
