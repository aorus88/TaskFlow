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

  

  // Statistiques tâches ouvertes
  const openTasks = tasks.filter((task) => 
    task.archived !== "closed" && !task.archivedAt
  );

  // Statistiques tâches prioritaires
  const highMediumPriorityOpen = tasks.filter((task) => 
    (task.priority === "high" || task.priority === "medium") 
    && task.archived !== "closed" 
    && !task.archivedAt
  );

  // Statistiques des tâches liquidées (closed)
  const closedTasksToday = tasks.filter(task => {
    if (task.archived === "closed" && task.archivedAt) {
      const archivedDate = new Date(task.archivedAt);
      return archivedDate.toDateString() === today.toDateString();
    }
    return false;
  });


  // Debug logs
  useEffect(() => {
    console.log("Date actuelle:", today);
    console.log("Tâches archivées:", tasks.filter(task => task.archivedAt));
    console.log("Tâches créées:", tasks.filter(task => task.addedAt));
  }, [tasks]);

  // Sessions du jour (TOUTES les tâches)
  const sessionsToday = tasks.flatMap((task) => task.sessions || [])
    .filter((session) => {
      const sessionDate = new Date(session.date);
      return sessionDate >= today && sessionDate < new Date(today.getTime() + 86400000);
    });

  // Sessions d'hier (TOUTES les tâches)
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
        return subtask ? `🆎 ${parentTask.name} > ${subtask.name}` : "Sous-tâche non trouvée";
      }
    } else {
      const task = tasks.find(t => t._id === id);
      return task ? `🅰️ ${task.name}` : "Tâche non trouvée";
    }
    return "Tâche non trouvée";
  };

  // Fonction pour déterminer l'emoji de récompense en fonction du pourcentage de progression
  const getRewardEmoji = (closedTasksToday) => {
    if (closedTasksToday >= 5) return "🏆🏆🏆"; // Trophée pour 100% ou plus
    if (closedTasksToday >= 4) return "🏆"; // Trophée pour 100% ou plus
    if (closedTasksToday >= 3) return "🎉"; // Confettis pour 75% ou plus
    if (closedTasksToday >= 2) return "👍"; // Pouce en l'air pour 50% ou plus
    if (closedTasksToday >= 1) return "🙂"; // Visage souriant pour 25% ou plus
    return "💪"; // Muscle pour moins de 1
  };

  const calculateCategoryDurations = (tasks) => {
    const categoryDurations = {};
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    tasks.forEach((task) => {
      if (task.categories && task.sessions) {
        const category = task.categories;
        const recentSessions = task.sessions.filter((session) => new Date(session.date) >= sevenDaysAgo);
        const totalDuration = recentSessions.reduce((sum, session) => sum + session.duration, 0);

        if (categoryDurations[category]) {
          categoryDurations[category] += totalDuration;
        } else {
          categoryDurations[category] = totalDuration;
        }
      }
    });

    return categoryDurations;
  };

  const sortCategoriesByDuration = (categoryDurations) => {
    const sortedCategories = Object.entries(categoryDurations).sort(([, durationA], [, durationB]) => durationB - durationA);
    return sortedCategories;
  };

  const getTop5Categories = (sortedCategories) => {
    return sortedCategories.slice(0, 5);
  };

  const formatDurationInHours = (duration) => {
    const hours = (duration / 60).toFixed(2);
    return `${hours}h`;
  };

  const categoryDurations = calculateCategoryDurations(tasks);
  const sortedCategories = sortCategoriesByDuration(categoryDurations);
  const top5Categories = getTop5Categories(sortedCategories);

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <h3>⛩️ TaskFlow 1.3.9 ⛩️ ➖
        <button onClick={toggleDarkMode} className="dark-mode-button">
          {isDarkMode ? "🌚" : "🌞"}
        </button>➖
        🕒 {formatClock(currentTime)} 🕒</h3>
      </div>

      <div className="statistics-grid">
        <div className="stat-card-tasks">
          <h4>Tâches Ouvertes</h4>
          <p>📋 {openTasks.length}</p>
          <h4>Tâches prioritaires</h4>
          <p>🔴🟠 {highMediumPriorityOpen.length}</p>
           <h4>Tâches liquidées (Aujourd'hui)</h4>
          <p>✅ {closedTasksToday.length}</p>
        </div>

        <div className="stat-card-duration">
          <h4>Durée (Hier) </h4>
          <p>⏱️ {formatTime(totalSessionTimeYesterday)}</p>
          <h4>Durée (Aujourd'hui)</h4>
          <p>⏱️ {formatTime(totalSessionTimeToday)}</p>
  
          <div className="spacer">
            </div> 
  
          <h4>Level</h4>
          <p className="reward-emoji">{getRewardEmoji(closedTasksToday.length)}</p>
        </div>

        <div className="stat-card-top5">
          <h4>Top 5 (7 derniers jours)</h4>
          {top5Categories.map(([category, duration]) => (
            <p key={category}>
              {category} : {formatDurationInHours(duration)}
            </p>
          ))}
        </div>

        <div className="stat-card-weather">
          <WeatherWidget />
        </div>
      </div>
    </div>
  );
};

export default Statistics;