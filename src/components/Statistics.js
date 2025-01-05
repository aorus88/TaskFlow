import React, { useContext } from "react";
import "./Statistics.css";
import { TimerContext } from "../context/TimerContext";

const Statistics = ({ tasks }) => {
  const { timeLeft } = useContext(TimerContext);

  // Tâches ouvertes (status !== 'closed' et pas de archivedAt)
  const openTasks = tasks.filter((task) => task.status !== "closed" && !task.archivedAt);

  // Tâches terminées aujourd'hui (archivedAt === date du jour et archived === 'closed')
  const today = new Date().toISOString().split("T")[0];
  const completedToday = tasks.filter((task) => {
    const archivedDate = task.archivedAt ? new Date(task.archivedAt).toISOString().split("T")[0] : null;
    return archivedDate === today && task.archived === "closed";
  });

  // Tâches prio haute ouvertes
  const highPriorityOpen = tasks.filter(
    (task) => task.priority === "high" && task.status !== "closed" && !task.archivedAt
  );

  // Sessions du jour
  const sessionsToday = tasks.flatMap(task => task.sessions || [])
    .filter(session => new Date(session.date).toISOString().split("T")[0] === today);

  // Sessions de la semaine
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const sessionsThisWeek = tasks.flatMap(task => task.sessions || [])
    .filter(session => new Date(session.date) >= startOfWeek);

  // Calcul du temps total des sessions du jour
  const totalSessionTimeToday = sessionsToday.reduce((total, session) => total + session.duration, 0);

  // Calcul du temps total des sessions de la semaine
  const totalSessionTimeThisWeek = sessionsThisWeek.reduce((total, session) => total + session.duration, 0);

  // Calcul du temps moyen par session
  const averageSessionTime = sessionsThisWeek.length > 0 ? totalSessionTimeThisWeek / sessionsThisWeek.length : 0;

  // Calcul du temps moyen par jour
  const averageSessionTimePerDay = sessionsThisWeek.length > 0 ? totalSessionTimeThisWeek / sessionsThisWeek.length : 0;

  // Format du temps en heures et minutes
  const formatTime = (mins) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
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
          <h3>Tâches Priorité Haute (Ouvertes)</h3>
          <p>🔴 {highPriorityOpen.length}</p>
        </div>

        <div className="stat-card">
          <h3>Sessions du Jour</h3>
          <p>⏱️ {sessionsToday.length}</p>
        </div>

        <div className="stat-card">
          <h3>Temps Total Sessions (Aujourd'hui)</h3>
          <p>🕒 {formatTime(totalSessionTimeToday)}</p>
        </div>

        <div className="stat-card">
          <h3>Sessions de la Semaine</h3>
          <p>📅 {sessionsThisWeek.length}</p>
        </div>

        <div className="stat-card">
          <h3>Temps Total Sessions (Semaine)</h3>
          <p>🕒 {formatTime(totalSessionTimeThisWeek)}</p>
        </div>

        <div className="stat-card">
          <h3>Durée Pomodoro Restant</h3>
          <p className="timer-display">{formatTimeWithSeconds(timeLeft)}</p>
          <p className="timer-note">
            {timeLeft > 0 ? "Temps restant" : "Temps écoulé"}
          </p>
        </div>

        <div className="stat-card">
          <h3>Temps Moyen par Session</h3>
          <p>⏲️ {formatTime(averageSessionTime)}</p>
        </div>

        <div className="stat-card">
          <h3>Temps Moyen par Jour</h3>
          <p>⏲️ {formatTime(averageSessionTimePerDay)}</p>
        </div>
      </div>
    </div>
  );
};

export default Statistics;