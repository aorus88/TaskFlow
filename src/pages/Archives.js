import React, { useState, useEffect } from "react";
import TaskItem from "../components/TaskItem";
import GlobalPomodoroTimer from "../components/GlobalPomodoroTimer"; // Importer le composant GlobalPomodoroTimer
import "./Archives.css";

const Archives = ({ 
  archivedTasks, 
  handleDeleteTask,
  onFetchArchivedTasks 
}) => {
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    if (onFetchArchivedTasks) {
      onFetchArchivedTasks(true);
    }
  }, []);

  console.log("Archives.js - Tâches archivées reçues :", archivedTasks);

  if (!archivedTasks || archivedTasks.length === 0) {
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

  const sortedTasks = [...archivedTasks].sort((a, b) => {
    const dateA = new Date(a.archivedAt);
    const dateB = new Date(b.archivedAt);
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  // Filtrer les sous-tâches archivées
  const archivedSubtasks = archivedTasks.flatMap(task =>
    task.subtasks.filter(subtask => subtask.archived === "closed").map(subtask => ({
      ...subtask,
      parentTaskName: task.name,
      parentTaskId: task._id,
    }))
  );

  console.log("Sous-tâches archivées :", archivedSubtasks);

  return (
    <div className="archives-page">
      <h1>Tâches Archivées</h1>

      {feedbackMessage && <div className="feedback-message">{feedbackMessage}</div>}

      <GlobalPomodoroTimer isPreview={true} /> {/* Afficher un aperçu du minuteur */}

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
            <li key={task._id} className="archived-task-item">
              <div className="task-header">
                <strong>Statut :</strong> 🔴 Closed
                <div className="task-details">
                  <span className="task-archived-date">
                    Archivé le : {formatDate(task.archivedAt)}
                  </span>
                </div>
                <span className="task-name"><strong>{task.name}</strong></span>
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
                  {Math.floor((task.totalTime || 0) / 60)} min passées
                </span>
                <hr className="task-separator" />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="archived-subtasks">
        <h2 className="archived-subtasks-title">Sous-tâches Archivées</h2>
        <ul className="archived-subtasks-list">
          {archivedSubtasks.map((subtask) => (
            <li key={subtask._id} className="archived-subtask-item">
              <div className="subtask-header">
                <strong>Sous-tâche :</strong> {subtask.name}
                <div className="subtask-details">
                  <span className="subtask-parent-task">
                    Tâche parente : {subtask.parentTaskName}
                  </span>
                </div>
              </div>
              <div className="subtask-archived-date">
                Archivé le : {formatDate(subtask.archivedAt)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Archives;