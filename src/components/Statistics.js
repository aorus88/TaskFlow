import React, { useContext, useEffect, useState } from "react";
import "./Statistics.css";
import WeatherWidget from "../components/WeatherWidget";
import { TimerContext } from "../context/TimerContext";

const Statistics = ({ tasks, isDarkMode, toggleDarkMode }) => {
  const { timeLeft, selectedTaskId } = useContext(TimerContext);
  
  // Ajout de l'état pour l'heure actuelle
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mise à jour de l'heure chaque seconde
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Fonction pour formater l'heure
  const formatClock = (time) => {
    return time.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Définition des dates repères
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Définition des tâches filtrées
  const openTasks = tasks.filter((task) => 
    task.status !== "closed" && !task.archivedAt
  );

  const highMediumPriorityOpen = tasks.filter((task) => 
    (task.priority === "high" || task.priority === "medium") 
    && task.status !== "closed" 
    && !task.archivedAt
  );

  // Debug logs
  useEffect(() => {
    console.log("Date actuelle:", today);
    console.log("Tâches archivées:", tasks.filter(task => task.archivedAt));
    console.log("Tâches créées:", tasks.filter(task => task.addedAt));
  }, [tasks]);

  // Sessions du jour
  const sessionsToday = tasks.flatMap((task) => task.sessions || [])
    .filter((session) => {
      const sessionDate = new Date(session.date);
      return sessionDate >= today && sessionDate < new Date(today.getTime() + 86400000);
    });

  // Sessions d'hier
  const sessionsYesterday = tasks.flatMap((task) => task.sessions || [])
    .filter((session) => {
      const sessionDate = new Date(session.date);
      return sessionDate >= yesterday && sessionDate < new Date(today.getTime() + 86400000);
    });

  // Calcul du temps total des sessions du jour
  const totalSessionTimeToday = sessionsToday.reduce((total, session) => total + session.duration, 0);

  // Calcul du temps total des sessions d'hier
  const totalSessionTimeYesterday = sessionsYesterday.reduce((total, session) => total + session.duration, 0);

  // Format du temps en heures et minutes
  const formatTime = (mins) => {
    const hours = Math.floor(mins / 60);
    const minutes = Math.round(mins % 60);
    return `${hours}h ${minutes}min`;
  };

  // Format du temps en heures, minutes et secondes pour la durée Pomodoro
  const formatTimeWithSeconds = (secs) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    return `${hours}h ${minutes}min ${seconds}sec`;
  };

  // Calcul de la progression des sessions
  const customDuration = "customDuration" in localStorage ? JSON.parse(localStorage.getItem("customDuration")) : 25;
  const totalSessionTime = customDuration * 60; // conversion en secondes
  const timeElapsed = totalSessionTime - timeLeft; // temps écoulé en secondes
  const progress = (timeElapsed / totalSessionTime) * 100; // pourcentage de progression
  const percentage = progress.toFixed(2); // formatage à deux décimales

  // Vérification pour éviter NaN
  const validProgress = isNaN(progress) ? 0 : progress;

  // Ajouter cette fonction pour obtenir le nom de la tâche/sous-tâche sélectionnée
  const getSelectedTaskName = () => {
    if (!selectedTaskId) return "Aucune tâche sélectionnée";
    
    // Nettoyer le selectedTaskId des guillemets supplémentaires
    const cleanTaskId = selectedTaskId.replace(/"/g, '');
    const [type, id] = cleanTaskId.split('-');
    
    if (type === 'subtask') {
      const parentTask = tasks.find(task => 
        task.subtasks?.some(subtask => subtask._id === id)
      );
      if (parentTask) {
        const subtask = parentTask.subtasks.find(st => st._id === id);
        return subtask ? `📌 ${parentTask.name} > ${subtask.name}` : "Sous-tâche non trouvée";
      }
    } else {
      const task = tasks.find(t => t._id === id);
      return task ? `⛩️ ${task.name}` : "Tâche non trouvée";
    }
    return "Tâche non trouvée";
  };

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <h2>📈 Statistiques  - ⛩️ TaskFlow 1.3.2 -  🕒 {formatClock(currentTime)}   
       
        <div className="dark-mode-toggle">
          <h3>Mode sombre</h3>
          <button onClick={toggleDarkMode} className="dark-mode-button">
            {isDarkMode ? "🌚" : "🌞"}
          </button>
          <div/>
        
        </div>    
           </h2>
      </div>

      <div className="statistics-grid">
        <div className="stat-card">
          <h3>Tâches Ouvertes</h3>
          <p>📋 {openTasks.length}</p>
          <h3>Hautes / Moyennes (Ouvertes)</h3>
          <p>🔴🟠 {highMediumPriorityOpen.length}</p>
        </div>

        <div className="stat-card">
          <h3>Sessions (Hier) </h3>
          <p>⏱️ {formatTime(totalSessionTimeYesterday)}</p>
          <h3>Sessions (Aujourd'hui)</h3>
          <p>⏱️ {formatTime(totalSessionTimeToday)}</p>
        </div>

        <div className="stat-card">
          <h3>⌛</h3>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${validProgress}%` }}></div>
          </div>
          <p>{validProgress.toFixed(2)}%</p>
          <p className="selected-task-name">{getSelectedTaskName()}</p>
          <h3>⌛</h3>
          <p className="timer-display">{formatTimeWithSeconds(timeLeft)}</p>
        </div>

        <div className="stat-card-weather">
          <WeatherWidget />
        </div>
      </div>
    </div>
  );
};

export default Statistics;