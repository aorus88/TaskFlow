import React, { useState } from "react";
import "./ArchivedTasks.css";
import "./Tasks.css";

const ArchivedTasks = ({ tasks, handleDeleteTask }) => {
  const [sortOrder, setSortOrder] = useState("desc"); // État pour trier les tâches

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

  // Tri des tâches archivées
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
  
  
          <strong>Statut :</strong> 🔴 Closed
          <div className="task-details">
              <span className="task-archived-date">
                Archivé le : {formatDate(task.archivedAt)}
              </span>
            </div>
              
              <span className="task-name">{task.name}</span>
            </div>

            <div className="task-priority">
              <span>
                {task.priority === "low" && "🟢 Basse"}
                {task.priority === "medium" && "🟠 Moyenne"}
                {task.priority === "high" && "🔴 Haute"}
              </span>
            </div>



            <div className="task-time-spent">
              <span>
                {Math.floor((task.timeSpent || 0) / 60)} min passées
              </span>
            </div>

            {/* Bouton pour supprimer la tâche archivée */}
            <div className="task-actions">
              <button
                className="delete-button"
                onClick={() => handleDeleteTask(task.id)}
              >
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ArchivedTasks;
