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

// Middleware CSP actualizado con connect-src
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy",
    "default-src 'self'; " +
    "connect-src 'self' https://api.weather.com https://api.open-meteo.com; " +
    "style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://www.gstatic.com; " +
    "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://translate.google.com https://www.gstatic.com;");
  next();
});

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

// Login
app.post('/login', (req, res) => {
  const { usuario } = req.body;
  if (usuario && usuario.trim() !== "") {
    req.session.usuario = usuario;
    return res.redirect('/');
  }
  res.redirect('/login.html');
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});

// API de clima actual
app.get('/api/clima', async (req, res) => {
  try {
    const url = `https://api.weather.com/v2/pws/observations/current?stationId=${STATION_ID}&format=json&units=m&apiKey=${API_KEY}`;
    const respuesta = await axios.get(url);
    res.json(respuesta.data);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo obtener el clima' });
  }
});

// API de pronóstico (Open-Meteo)
app.get('/api/forecast', async (req, res) => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=36.985&longitude=-4.223&daily=temperature_2m_min,temperature_2m_max,weathercode,precipitation_probability_max&timezone=auto`;
  try {
    const respuesta = await axios.get(url);
    res.json(respuesta.data);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo obtener el pronóstico' });
  }
});

// Ruta de sesión (necesaria para evitar errores 404)
app.get('/verificar-sesion', (req, res) => {
  res.json({ activo: !!req.session.usuario });
});

// Fallback 404
app.use((req, res) => {
  res.status(404).send('Página no encontrada');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
