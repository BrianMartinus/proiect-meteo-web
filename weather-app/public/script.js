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
        <div>
      
          <p><b><img src="/images/cloudy.png" class="imagineIcon">${currentWeather.descriere.charAt(0).toUpperCase() + currentWeather.descriere.slice(1)}</b></p>
        </div>
          <p>🌡️ <b>Temperatura:</b> ${currentWeather.temperaturaC.toFixed(1)}°C / ${currentWeather.temperaturaF.toFixed(1)}°F</p>
          <p>💧 <b>Umiditate:</b> ${currentWeather.umiditate}%</p>
        </div>
        <div class="middleWeather">
            <h2>🌤️ Vremea în <span class="underline">${currentWeather.oras}</span></h2>
        </div>
        <div class="rightWeather">
          <p>💨 <b>Vânt din</b> ${vantText}</p>
          <p>🌅 <b>Răsărit</b>: ${currentWeather.rasarit}</p>
          <p>🌇 <b>Apus:</b> ${currentWeather.apus}</p>
        </div>
      </div>
      <p><strong>${currentWeather.mesaj}</strong></p>
    `;


weatherHourly.innerHTML = peOre.map(item => {
  // Verificăm descrierea și adăugăm clasa corespunzătoare
  let bgClass = '';
  const desc = item.descriere.toLowerCase();
  const ora = Number(item.data.split(" ")[1].split(":")[0]);

  if (desc.includes('ploaie')) {
    bgClass = 'rainy-bg';
  } else if (desc.includes('soare') || desc.includes('însorit') || desc.includes('senin')) {
    bgClass = 'sunny-bg';
  } else if (desc.includes('nor') || desc.includes('înnorat')) {
    bgClass = 'cloudy-bg';
  }else{
    bgClass = 'other-bg';
  }
  
  if((ora >=21 && ora <=23 )|| (ora >=0 && ora <=5)){
    if (desc.includes('Ploaie')) {
      bgClass = 'rainy-bg-night';
    } else if (desc.includes('nor')){
      bgClass = 'cloudy-bg-night';
    }else{
      bgClass = 'night';
    }
  }

  return `
    <div class="weather-box ${bgClass}">
      <p><strong>🕒${item.data.split(" ")[1].slice(0,5)}</strong></p>
      <div class="comboImage">
        <img src="/images/cloudy.png" class="imagineIcon">
        <p>${item.descriere.charAt(0).toUpperCase() + item.descriere.slice(1)}</p>
      </div>
      <p>🌡️ ${item.temperaturaC}°C / ${item.temperaturaF}°F</p>

      <p>💧 ${item.umiditate}% umiditate</p>
     <p>💨 Vânt: ${item.vant}</p>

    </div>
  `;
}).join("");

    // Daily forecast - Adding wind direction as well
    weatherDaily.innerHTML = peZile.map(item => {
      
      let bgClass = '';
      const desc = item.descriere.toLowerCase();

      if (desc.includes('ploaie')) {
        bgClass = 'rainy-bg';
      } else if (desc.includes('soare') || desc.includes('însorit') || desc.includes('senin')) {
        bgClass = 'sunny-bg';
      } else if (desc.includes('nor') || desc.includes('înnorat')) {
        bgClass = 'cloudy-bg';
      } else {
        bgClass = 'other-bg';
      }

 

      return `
        <div class="weather-box ${bgClass}">
          <p><strong>📅${item.data.charAt(0).toUpperCase() + item.data.slice(1)}</strong></p>
          <div class="comboImage">
            <img src="/images/cloudy.png" class="imagineIcon">
          <p>${item.descriere.charAt(0).toUpperCase() + item.descriere.slice(1)}</p>
          </div>
          <p style="font-size:28px;">🌡️ ${item.temperaturaC}°C / ${item.temperaturaF}°F</p>
          <p>💧 ${item.umiditate}% umiditate</p>
          <p>💨 Vânt: ${item.vant}</p>

        </div>
      `;
    }).join("");

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

function setBackgroundPentruVreme(item, elementWeatherBox) {
  if (item.descriere.toLowerCase().includes("ploaie")) {
    elementWeatherBox.className = "weather-box rainy-bg";
  } else {
    elementWeatherBox.className = "weather-box default-bg";
  }
}
