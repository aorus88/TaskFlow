import React, { useState, useEffect } from "react";
import TaskItem from "../components/TaskItem";
import "./Archives.css"; // Importer les styles spécifiques

const Archives = ({ 
  archivedTasks, 
  handleDeleteTask,
  onFetchArchivedTasks // <-- Nouvelle prop pour charger les archives depuis l'API 
}) => {
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // État pour trier les tâches

  // Charger les tâches archivées quand on arrive sur la page
  useEffect(() => {
    if (onFetchArchivedTasks) {
      onFetchArchivedTasks(true); // Passez true pour charger les tâches archivées
    }
  }, []); // Ajoutez un tableau de dépendances vide pour appeler une seule fois

  // Suppression d'une tâche archivée
  //const handleDeleteArchivedTask = (taskId) => {
   // handleDeleteTask(taskId, true); // true = tâche archivée
    //setFeedbackMessage("Tâche archivée supprimée avec succès !");
   // setTimeout(() => setFeedbackMessage(""), 3000);
  //};

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

  // Tri des tâches archivées
  const sortedTasks = [...archivedTasks].sort((a, b) => {
    const dateA = new Date(a.archivedAt);
    const dateB = new Date(b.archivedAt);
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="archives-page">
      <h1>Tâches Archivées</h1>

      {/* Affichage du message de feedback */}
      {feedbackMessage && <div className="feedback-message">{feedbackMessage}</div>}

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
                  {Math.floor((task.timeSpent || 0) / 60)} min passées
                </span>

                  <hr className="task-separator" />
              </div>
            
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Archives;