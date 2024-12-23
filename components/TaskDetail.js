import React, { useState } from "react";
import EditTaskModal from "./EditTaskModal"; // Assurez-vous que ce composant est correctement configuré
import "./TaskDetail.css"; // Fichier de styles spécifique au composant

const TaskDetail = ({ task, onAddSubtask, onDeleteSubtask, onSave }) => {
  const [newSubtask, setNewSubtask] = useState("");
  const [isEditing, setIsEditing] = useState(false); // État pour ouvrir/fermer la modale
  const [feedbackMessage, setFeedbackMessage] = useState(""); // État pour le feedback utilisateur

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
    setFeedbackMessage("Sous-tâche ajoutée avec succès !");
    setTimeout(() => setFeedbackMessage(""), 3000); // Efface le message après 3 secondes
  };

  // Gestion de la sauvegarde après modification dans la modale
  const handleSaveTask = (updatedTask) => {
    onSave(updatedTask); // Appelle la fonction parent pour sauvegarder la tâche
    setFeedbackMessage("Tâche mise à jour avec succès !");
    setTimeout(() => setFeedbackMessage(""), 3000); // Efface le message après 3 secondes
    setIsEditing(false); // Ferme la modale
  };

  return (
    <div className="task-detail">
      {/* Affichage du titre de la tâche */}
      <h2>{task.title}</h2>
      <p>{task.description || "Pas de description disponible."}</p>

      {/* Message de feedback */}
      {feedbackMessage && <p className="feedback-message">{feedbackMessage}</p>}

      {/* Bouton pour éditer la tâche */}
      <button className="edit-button" onClick={() => setIsEditing(true)}>
        Modifier la tâche
      </button>

      {/* Liste des sous-tâches */}
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

      {/* Modale pour l'édition de la tâche */}
      {isEditing && (
        <EditTaskModal
          task={task} // Passe la tâche actuelle à la modale
          onClose={() => setIsEditing(false)} // Ferme la modale
          onSave={handleSaveTask} // Sauvegarde les modifications
        />
      )}
    </div>
  );
};

export default TaskDetail;
