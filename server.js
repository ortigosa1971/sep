
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

const API_KEY = 'e19cf0d935fc49329cf0d935fc5932cc';
const STATION_ID = 'IALFAR30';

app.use(cors());
app.use(express.static('public'));

app.get('/api/clima', async (req, res) => {
  try {
    const url = `https://api.weather.com/v2/pws/observations/current?stationId=${STATION_ID}&format=json&units=m&apiKey=${API_KEY}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    console.error("❌ Error al obtener clima:", err.message);
    res.status(500).json({ error: "Error al obtener clima" });
  }
});

app.listen(PORT, () => {
  console.log(`🌍 Servidor en ejecución en el puerto ${PORT}`);
});
