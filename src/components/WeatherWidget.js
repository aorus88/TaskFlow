import React, { useState, useEffect } from "react";
import "./WeatherWidget.css";

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  const location = "Lausanne";
  const apiKey = "e67be99e9774281db7d895e637a5a008";

  const weatherTranslations = {
    "clear sky": "Ciel dégagé",
    "few clouds": "Quelques nuages",
    "scattered clouds": "Quelques nuages",
    "broken clouds": "Nuages fragmentés",
    "shower rain": "Averses",
    "rain": "Pluie",
    "thunderstorm": "Orage",
    "snow": "Neige",
    "mist": "Brume",
  };

  const getWeatherClass = (condition) => {
    if (condition.includes("clear")) return "sun";
    if (condition.includes("cloud")) return "cloud";
    if (condition.includes("rain")) return "rain";
    if (condition.includes("snow")) return "snow";
    if (condition.includes("wind")) return "wind";
    return ""; // Classe par défaut
  };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${apiKey}`
        );
        if (!response.ok) throw new Error(`Erreur API : ${response.status}`);
        const data = await response.json();
        setWeather(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchWeather();
  }, []);

  if (error) return <p>Erreur : {error}</p>;
  if (!weather) return <p>Chargement de la météo...</p>;

  const weatherCondition = weather.weather[0].main.toLowerCase();
  const weatherClass = getWeatherClass(weatherCondition);

  const translatedDescription =
    weatherTranslations[weather.weather[0].description.toLowerCase()] ||
    weather.weather[0].description;

  const weatherIcon =
    weatherClass === "sun"
      ? "☀️"
      : weatherClass === "cloud"
      ? "☁️"
      : weatherClass === "rain"
      ? "🌧️"
      : weatherClass === "snow"
      ? "❄️"
      : weatherClass === "wind"
      ? "💨"
      : "🌈";

  return (
    <div className={`weather-widget ${weatherClass}`}>
      <div className="weather-widget-icon">{weatherIcon}</div>
      <h3>Météo à {weather.name}</h3>
      <p>{translatedDescription}</p>
      <p>Température : {weather.main.temp}°C</p>
    </div>
  );
};

export default WeatherWidget;
