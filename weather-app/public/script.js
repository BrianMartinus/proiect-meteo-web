function directionFromDegrees(degree) {
  const directions = [
    "nord", "nord-est", "est", "sud-est",
    "sud", "sud-vest", "vest", "nord-vest"
  ];
  const index = Math.round(degree / 45) % 8;
  return directions[index];
}

async function getFullWeather() {
  const city = document.getElementById('cityInput').value;
  const weatherCurrent = document.getElementById('weatherCurrent');
  const weatherHourly = document.getElementById('weatherHourly');
  const weatherDaily = document.getElementById('weatherDaily');

  if (!city) {
    weatherCurrent.innerHTML = "<p>Te rog introdu un oraș.</p>";
    weatherHourly.innerHTML = "";
    weatherDaily.innerHTML = "";
    return;
  }
  localStorage.setItem('savedCity', city);


  try {
    const response = await fetch('/fullweather', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city })
    });

    const data = await response.json();

    if (data.error) {
      weatherCurrent.innerHTML = `<p>${data.error}</p>`;
      weatherHourly.innerHTML = "";
      weatherDaily.innerHTML = "";
      return;
    }

    const { currentWeather, peOre, peZile } = data;

    const vantText = currentWeather.vant;

    weatherCurrent.innerHTML = `

      <div class="divWeather">
        <div class="leftWeather">
          <p><img src="/images/cloudy.png" class="imagineIcon">${currentWeather.descriere.charAt(0).toUpperCase() + currentWeather.descriere.slice(1)}</p>
          <p>🌡️ ${currentWeather.temperaturaC.toFixed(1)}°C / ${currentWeather.temperaturaF.toFixed(1)}°F</p>
          <p>💧 Umiditate: ${currentWeather.umiditate}%</p>
        </div>
        <div class="middleWeather">
              <h2>🌤️ Vremea în ${currentWeather.oras}</h2>
        </div>
        <div class="rightWeather">
          <p>💨 Vânt din ${vantText}</p>
          <p>🌅 Răsărit: ${currentWeather.rasarit}</p>
          <p>🌇 Apus: ${currentWeather.apus}</p>
        </div>
      </div>
      <p><strong>${currentWeather.mesaj}</strong></p>
    `;

    // Hourly forecast - Adding wind direction with the helper function
    weatherHourly.innerHTML = peOre.map(item => `
      <div class="weather-box">
        <p><strong>${item.data.split(" ")[1].slice(0,5)}</strong></p>
        <p>${item.descriere}</p>
        <p>🌡️ ${item.temperaturaC}°C</p>
        <p>💧 ${item.umiditate}%</p>
        <p>💨 Vânt din ${directionFromDegrees(item.vant)}</p> <!-- Update here -->
      </div>
    `).join("");

    // Daily forecast - Adding wind direction as well
    weatherDaily.innerHTML = peZile.map(item => `
      <div class="weather-box">
        <p><strong>${item.data}</strong></p>
        <p>${item.descriere}</p>
        <p>🌡️ ${item.temperaturaC}°C</p>
        <p>💧 ${item.umiditate}%</p>
        <p>💨 Vânt din ${directionFromDegrees(item.vant)}</p> <!-- Update here -->
      </div>
    `).join("");

  } catch (err) {
    weatherCurrent.innerHTML = "<p>Eroare la preluarea datelor.</p>";
    weatherHourly.innerHTML = "";
    weatherDaily.innerHTML = "";
  }
} 
window.addEventListener('DOMContentLoaded', () => {
  const savedCity = localStorage.getItem('savedCity');
  if (savedCity) {
    document.getElementById('cityInput').value = savedCity;
    getFullWeather();
  }
});
