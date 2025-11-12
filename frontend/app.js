// app.js - frontend logic
const API_BASE = "http://localhost:3000/api/weather"; // backend URL (change port if needed)

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const errorDiv = document.getElementById("error");
const result = document.getElementById("result");

const locationEl = document.getElementById("location");
const tempEl = document.getElementById("temp");
const descriptionEl = document.getElementById("description");
const feelsEl = document.getElementById("feels");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const forecastGrid = document.getElementById("forecastGrid");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) {
    showError("Please enter a city name.");
    return;
  }
  fetchWeather(city);
});

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

function showError(msg) {
  errorDiv.textContent = msg;
  result.classList.add("hidden");
  setTimeout(() => (errorDiv.textContent = ""), 3500);
}

async function fetchWeather(city) {
  try {
    errorDiv.textContent = "";
    const res = await fetch(`${API_BASE}?q=${city}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      showError(err.error || "Failed to fetch weather");
      return;
    }
    const data = await res.json();
    render(data);
  } catch (err) {
    console.error(err);
    showError("Network error. Make sure backend is running.");
  }
}

function render(data) {
  result.classList.remove("hidden");
  locationEl.textContent = `${data.city}, ${data.country || ""}`;
  const cur = data.current;
  tempEl.textContent = `${Math.round(cur.temp)}°C`;
  descriptionEl.textContent =
    (cur.weather && cur.weather[0] && cur.weather[0].description) || "";
  feelsEl.textContent = Math.round(cur.feels_like);
  humidityEl.textContent = cur.humidity;
  windEl.textContent = (cur.wind && cur.wind.speed) || "N/A";

  // Build daily forecast by grouping forecast list by date
  const byDate = {};
  data.forecast.forEach((item) => {
    // item.dt_txt like "2025-11-11 12:00:00"
    const day = item.dt_txt.split(" ")[0];
    if (!byDate[day]) byDate[day] = [];
    byDate[day].push(item);
  });

  const days = Object.keys(byDate).slice(0, 5); // first 5 days
  forecastGrid.innerHTML = "";
  days.forEach((day) => {
    const items = byDate[day];
    // average temp for day
    const temps = items.map((i) => i.main.temp);
    const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
    // pick the first weather icon/desc
    const desc = items[0].weather[0].description;
    const el = document.createElement("div");
    el.className = "day";
    el.innerHTML = `<div class="date">${day}</div>
                    <div class="desc">${desc}</div>
                    <div class="t">${Math.round(avg)}°C</div>`;
    forecastGrid.appendChild(el);
  });
}
