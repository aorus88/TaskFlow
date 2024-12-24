import React, { useState } from "react"; // Ajout de useState pour gérer l'état
import "./ArchivedTasks.css";

const ArchivedTasks = ({ tasks }) => {
  const [sortOrder, setSortOrder] = useState("desc"); // Déclaration correcte de l'état

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

  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = new Date(a.archivedAt);
    const dateB = new Date(b.archivedAt);
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="archived-tasks">
      <div className="archived-tasks-header">
        <h2 className="archived-tasks-title">Tâches Archivées</h2>
        <button
          className="sort-button"
          onClick={() =>
            setSortOrder((prevOrder) => (prevOrder === "desc" ? "asc" : "desc"))
          }
        >
          Trier : {sortOrder === "desc" ? "Plus récent" : "Plus ancien"}
        </button>
      </div>
      <ul className="archived-tasks-list">
        {sortedTasks.map((task) => (
          <li key={task.id} className="archived-task-item">
            <div className="task-header">
              <span className="task-name">{task.name}</span>
              </div>

              <div className="task-priority">
              <span className="task-priority">
                {task.priority === "low" && "🟢 Basse"}
                {task.priority === "medium" && "🟠 Moyenne"}
                {task.priority === "high" && "🔴 Haute"}
              </span>
            </div>

            <div className="task-details">
              <span className="task-archived-date">
                Archivé le : {formatDate(task.archivedAt)}
              </span>
              </div>

              <div className="task-time-spent">
              <span className="task-time-spent">
                {Math.floor((task.timeSpent || 0) / 60)} min passées
              </span>
            </div>

          </li>
        ))}
      </ul>
    </div>
  );
};

export default ArchivedTasks;
