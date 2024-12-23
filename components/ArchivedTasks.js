import React from "react";
import "./ArchivedTasks.css"; // Import des styles pour les tâches archivées

const ArchivedTasks = ({ tasks }) => {
  if (!tasks || tasks.length === 0) {
    return <div className="archived-tasks-empty">Aucune tâche archivée.</div>;
  }

  const formatDate = (date) => {
    if (!date) return "Date inconnue";
    const parsedDate = new Date(date);
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(parsedDate);
  };

  return (
    <div className="archived-tasks">
      <h2 className="archived-tasks-title">Tâches Archivées</h2>
      <ul className="archived-tasks-list">
        {tasks.map((task) => (
          <li key={task.id} className="archived-task-item">
            <span className="task-name">{task.name}</span>
            <span className="task-archived-date">
              Archivé le : {formatDate(task.archivedAt)}
            </span>
            <span className="task-priority">
              {task.priority === "low" && "🟢 Basse"}
              {task.priority === "medium" && "🟠 Moyenne"}
              {task.priority === "high" && "🔴 Haute"}
            </span>
            <span className="task-time-spent">
              {Math.floor((task.timeSpent || 0) / 60)} min passées
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ArchivedTasks;
