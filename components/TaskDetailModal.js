import React from "react";
import "./TaskDetailModal.css"; // Fichier CSS pour la modale

const TaskDetailModal = ({ task, onClose }) => {
  if (!task) return null; // Si aucune tâche n'est sélectionnée, ne pas afficher la modale

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Détails de la tâche</h3>
        <p>
          <strong>Nom :</strong> {task.name}
        </p>
        <p>
          <strong>Date :</strong> {task.date}
        </p>
        <p>
          <strong>Priorité :</strong>{" "}
          {task.priority === "low" && "🟢 Basse"}
          {task.priority === "medium" && "🟠 Moyenne"}
          {task.priority === "high" && "🔴 Haute"}
        </p>
        <p>
          <strong>Durée Pomodoro :</strong>{" "}
          {Math.floor((task.timeSpent || 0) / 60)} min
        </p>
        <button className="close-button" onClick={onClose}>
          Fermer
        </button>
      </div>
    </div>
  );
};

export default TaskDetailModal;
