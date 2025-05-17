require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = 3000;
const API_KEY = process.env.API_KEY;

app.use(express.json());
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Funcție pentru a obține direcția vântului
function directionFromDegrees(degree) {
  const directions = [
    "nord", "nord-est", "est", "sud-est",
    "sud", "sud-vest", "vest", "nord-vest"
  ];
  const index = Math.round(degree / 45) % 8;
  return directions[index];
}

function getWindDirection(deg) {
  return deg === undefined ? 'necunoscut' : directionFromDegrees(deg);
}

// Route principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Endpoint pentru vreme completă
app.post('/fullweather', async (req, res) => {
  const { city } = req.body;

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=ro`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=ro`)
    ]);

    if (!currentRes.ok || !forecastRes.ok) {
      return res.status(400).json({ error: "Orașul nu a fost găsit." });
    }

    const current = await currentRes.json();
    const forecast = await forecastRes.json();

    // Vreme curentă
    const currentWeather = {
      oras: current.name,
      temperaturaC: current.main.temp,
      temperaturaF: (current.main.temp * 9 / 5) + 32,
      descriere: current.weather[0].description,
      umiditate: current.main.humidity,
      vant: `${current.wind.speed} m/s - ${getWindDirection(current.wind.deg)}`,
      rasarit: new Date(current.sys.sunrise * 1000).toLocaleTimeString('ro-RO'),
      apus: new Date(current.sys.sunset * 1000).toLocaleTimeString('ro-RO'),
      mesaj:
        current.main.temp > 25
          ? "E cald afară, nu uita de loțiune!"
          : current.main.temp < 10
            ? "Ia o haină groasă! O răceală nu este ce-ți dorești acum"
            : "O zi plăcută! Go get fun"
    };

    // Prognoză pe ore (următoarele 8 = 24h)
    const peOre = forecast.list.slice(0, 8).map(item => {
      const tempC = item.main.temp;
      const tempF = (tempC * 9 / 5) + 32;

      return {
        data: item.dt_txt,
        temperaturaC: tempC.toFixed(1),
        temperaturaF: tempF.toFixed(1),
        descriere: item.weather[0].description,
        umiditate: item.main.humidity,
        vant: getWindDirection(item.wind.deg)
      };
    });

    // Prognoză pe zile (ora 12:00)
    const peZile = forecast.list
      .filter(item => item.dt_txt.includes('12:00:00'))
      .slice(0, 5)
      .map(item => {
        const tempC = item.main.temp;
        const tempF = (tempC * 9 / 5) + 32;

        return {
          data: new Date(item.dt * 1000).toLocaleDateString('ro-RO', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          }),
          temperaturaC: tempC.toFixed(1),
          temperaturaF: tempF.toFixed(1),
          descriere: item.weather[0].description,
          umiditate: item.main.humidity,
          vant: getWindDirection(item.wind.deg)
        };
      });

    res.json({ currentWeather, peOre, peZile });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Eroare la procesarea datelor meteo." });
  }
});

// Pornire server
app.listen(PORT, () => {
  console.log(`Serverul rulează la http://localhost:${PORT}`);
});
