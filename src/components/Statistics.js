import React, { useContext, useEffect } from "react";
import "./Statistics.css";
import { TimerContext } from "../context/TimerContext";

const Statistics = ({ tasks, isDarkMode, toggleDarkMode }) => {
  const { timeLeft } = useContext(TimerContext);

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

  const completedToday = tasks.filter((task) => {
    if (!task.archivedAt || task.archived !== "closed") return false;
    const archivedDate = new Date(task.archivedAt);
    return archivedDate >= today && archivedDate <= endOfDay;
  });

  const createdToday = tasks.filter((task) => {
    if (!task.addedAt) return false;
    const addedDate = new Date(task.addedAt);
    return addedDate >= today && addedDate <= endOfDay;
  });

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
      return sessionDate >= yesterday && sessionDate < today;
    });

  // Sessions totales
  const totalSessions = tasks.flatMap(task => task.sessions || []);

  // Calcul du temps total des sessions du jour
  const totalSessionTimeToday = sessionsToday.reduce((total, session) => total + session.duration, 0);

  // Calcul du temps moyen par session
  const averageSessionTime = totalSessions.length > 0 ? totalSessions.reduce((total, session) => total + session.duration, 0) / totalSessions.length : 0;

  // Calcul du temps moyen par jour
  const daysWithSessions = [...new Set(totalSessions.map(session => new Date(session.date).toISOString().split("T")[0]))].length;
  const averageSessionTimePerDay = daysWithSessions > 0 ? totalSessions.reduce((total, session) => total + session.duration, 0) / daysWithSessions : 0;

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

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <h2>Statistiques 📈</h2>
      </div>

      <div className="statistics-grid">
        <div className="stat-card">
          <h3>Tâches Ouvertes</h3>
          <p>📋 {openTasks.length}</p>
        </div>

        <div className="stat-card">
          <h3>Tâches Terminées Aujourd'hui</h3>
          <p>✅ {completedToday.length}</p>
        </div>

        <div className="stat-card">
          <h3>Tâches Créées Aujourd'hui</h3>
          <p>🆕 {createdToday.length}</p>
        </div>

        <div className="stat-card">
          <h3>Tâches Priorité Haute et Moyenne (Ouvertes)</h3>
          <p>🔴🟠 {highMediumPriorityOpen.length}</p>
        </div>

        <div className="stat-card">
          <h3>Sessions du Jour</h3>
          <p>⏱️ {sessionsToday.length}</p>
        </div>

        <div className="stat-card">
          <h3>Sessions Hier</h3>
          <p>⏱️ {sessionsYesterday.length}</p>
        </div>

        <div className="stat-card">
          <h3>Total sessions (Aujourd'hui)</h3>
          <p>🕒 {formatTime(totalSessionTimeToday)}</p>
        </div>

        <div className="stat-card">
          <h3>Sessions Totales</h3>
          <p>📊 {totalSessions.length}</p>
        </div>

        <div className="stat-card">
          <h3>Time Left ⏯️</h3>
          <p className="timer-display">{formatTimeWithSeconds(timeLeft)}</p>
        </div>

        <div className="stat-card">
          <h3>Moyenne Pomodoro par session</h3>
          <p>🏔️ {formatTime(averageSessionTime)}</p>
        </div>

        <div className="stat-card">
          <h3>Moyenne Pomodoro par jour</h3>
          <p>🏔️ {formatTime(averageSessionTimePerDay)}</p>
        </div>

        <div className="stat-card">
          <button onClick={toggleDarkMode} className="dark-mode-toggle">
            {isDarkMode ? 'Mode Clair' : 'Mode Sombre'}
          </button>
        </div>

        
      </div>
    </div>
  );
};

export default Statistics;