import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ path: "api.env" });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENWEATHER_API_KEY;

app.get("/", (req, res) => {
  res.send("🌤️ Weather backend is running!");
});

app.get("/api/weather", async (req, res) => {
  const city = req.query.q || req.query.city; // support both q= and city=
  if (!city) return res.status(400).json({ error: "City name required" });

  try {
    // Fetch current weather
    const currentURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const current = await axios.get(currentURL);

    // Fetch forecast
    const { coord } = current.data;
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${coord.lat}&lon=${coord.lon}&appid=${API_KEY}&units=metric`;
    const forecast = await axios.get(forecastURL);

    res.json({
      city: current.data.name,
      country: current.data.sys.country,
      current: {
        temp: current.data.main.temp,
        feels_like: current.data.main.feels_like,
        humidity: current.data.main.humidity,
        wind: current.data.wind,
        weather: current.data.weather,
      },
      forecast: forecast.data.list, // let frontend process daily grouping
    });
  } catch (err) {
    console.error("Weather API error:", err.message);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
