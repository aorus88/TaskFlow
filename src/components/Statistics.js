import React, { useContext } from "react";
import "./Statistics.css";
import { TimerContext } from "../context/TimerContext";

const Statistics = ({ tasks, archivedTasks }) => {
  const { timeLeft } = useContext(TimerContext);

  // Tâches ouvertes (status !== 'closed')
  const openTasks = tasks.filter((task) => task.status !== "closed");

  // Tâches terminées aujourd'hui (archivedAt === date du jour)
  const today = new Date().toISOString().split("T")[0];
  const completedToday = archivedTasks.filter((task) => {
    return task.archivedAt && task.archivedAt.startsWith(today);
  });

  // Tâches prio haute ouvertes
  const highPriorityOpen = tasks.filter(
    (task) => task.priority === "high" && task.status !== "closed"
  );

  // Format du temps
  const formatTime = (secs) => {
    const min = Math.floor(secs / 60);
    const s = secs % 60;
    return `${min.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <h2>Statistiques 📈</h2>
      </div>

      <div className="statistics-grid">
        <div className="stat-card">
          <h3>Tâches Ouvertes</h3>
          <p>{openTasks.length}</p>
        </div>

        <div className="stat-card">
          <h3>Tâches Terminées Aujourd'hui</h3>
          <p>{completedToday.length}</p>
        </div>

        <div className="stat-card">
          <h3>Tâches Priorité Haute (Ouvertes)</h3>
          <p>{highPriorityOpen.length}</p>
        </div>

        <div className="stat-card">
          <h3>Durée Pomodoro Restant</h3>
          <p className="timer-display">{formatTime(timeLeft)}</p>

          <p className="timer-note">
            {timeLeft > 0 ? "Temps restant" : "Temps écoulé"}
          </p>


        </div>
      </div>
    </div>
  );
};

export default Statistics;