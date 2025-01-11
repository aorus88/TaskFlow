import React, { useState, useEffect } from "react";
import "./WeatherWidget.css";

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());

  const location = "Coppet";
  const apiKey = "6646ef98bb617a6aa6419692cb622d72";

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
    "fog": "Brouillard",
    "light rain": "Pluie légère",
    "overcast clouds": "Nuages couverts",
    "freezing" : "Gel",
    "drizzle" : "Brouillard",
  };

  const getWeatherClass = (condition) => {
    if (condition.includes("clear")) return "Ensoleillé";
    if (condition.includes("cloud")) return "Nuageux";
    if (condition.includes("rain")) return "Pluie";
    if (condition.includes("snow")) return "Neige";
    if (condition.includes("wind")) return "Vents";
    if (condition.includes("fog")) return "Vents";
    if (condition.includes("freezing")) return "Gel";
    if (condition.includes("drizzle")) return "Brouillard";
    return ""; // Classe par défaut
  };
  

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${apiKey}&lang=fr`
        );
        if (!response.ok) throw new Error(`Erreur API : ${response.status}`);
        const data = await response.json();
        setWeather(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchWeather();

    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval); // Nettoyage pour éviter les fuites de mémoire
  }, []);

  if (error) return <p>Erreur : {error}</p>;
  if (!weather) return <p>Chargement de la météo...</p>;

  const weatherCondition = weather.weather[0].main.toLowerCase();
  const weatherClass = getWeatherClass(weatherCondition);

  const translatedDescription =
    weatherTranslations[weather.weather[0].description.toLowerCase()] ||
    weather.weather[0].description;

  const weatherIcon =
    weatherClass === "Ensoleillé"
      ? "☀️"
      : weatherClass === "Nuageux"
      ? "☁️"
      : weatherClass === "Pluie"
      ? "🌧️"
      : weatherClass === "Neige"
      ? "❄️"
      : weatherClass === "Vents"
      ? "💨"
      : weatherClass === "Gel"
      ? "❄️"
      : weatherClass === "Brouillard"
      ? "🌫️"
      : "🌈";

  // Fonction pour obtenir l'emoji en fonction de l'heure actuelle
  const getEmojiForTime = () => {
    const hour = time.getHours();
    if (hour >= 0 && hour < 4) {
      return "🌙"; // Nuit
    } else if (hour >= 4 && hour < 8) {
      return "🌅"; // Aube
    } else if (hour >= 8 && hour < 12) {
      return "☀️"; // Matin
    } else if (hour >= 12 && hour < 16) {
      return "🌤️"; // Après-midi
    } else if (hour >= 16 && hour < 20) {
      return "🌇"; // Soir
    } else {
      return "🌃"; // Nuit
    }
  };

  return (
    <div className={`weather-widget ${weatherClass}`}>
      <div className="weather-widget-icon">{weatherIcon} {getEmojiForTime()}  </div>      
      <h3>Météo à {weather.name}</h3>
      <p>{translatedDescription}    
      </p>
      <p>Température : {weather.main.temp}°C - Ressenti : {weather.main.feels_like}°C - Humidité : {weather.main.humidity}%</p>
      <p></p>

    </div>
  );
};

export default WeatherWidget;
