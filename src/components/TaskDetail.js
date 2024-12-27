import React, { useState } from "react";
import "./TaskDetail.css"; // Styles combinés pour les deux versions


const TaskDetail = ({ task, onAddSubtask, onDeleteSubtask, onClose, onSave, isModal = false }) => {
  const [newSubtask, setNewSubtask] = useState("");
  const [isEditing, setIsEditing] = useState(false); // Gère l'état d'édition

  if (!task) return null; // Si aucune tâche n'est sélectionnée, rien n'est rendu

  // Gestion de l'ajout d'une sous-tâche
  const handleAddSubtask = () => {
    if (!newSubtask.trim()) {
      alert("Le titre de la sous-tâche ne peut pas être vide.");
      return;
    }
    onAddSubtask(task.id, {
      id: Date.now(),
      title: newSubtask,
      completed: false,
    });
    setNewSubtask("");
  };

  return (
    <div className={isModal ? "modal-overlay" : "task-detail"}>
      <div className={isModal ? "modal" : "task-detail-content"}>
        <h2>{task.title || "Tâche sans titre"}</h2>
        <p>{task.description || "Pas de description disponible."}</p>

        {/* Détails supplémentaires */}
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

        {/* Sous-tâches */}
        <h3>Sous-tâches</h3>
        <ul className="subtask-list">
          {task.subtasks.map((subtask) => (
            <li key={subtask.id} className="subtask-item">
              {subtask.title}
              <button
                className="delete-button"
                onClick={() => onDeleteSubtask(task.id, subtask.id)}
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>

        {/* Formulaire pour ajouter une sous-tâche */}
        <div className="subtask-form">
          <input
            type="text"
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            placeholder="Nouvelle sous-tâche"
          />
          <button className="add-button" onClick={handleAddSubtask}>
            Ajouter
          </button>
        </div>

        {/* Actions supplémentaires */}
        {isModal && (
          <button className="close-button" onClick={onClose}>
            Fermer
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskDetail;
