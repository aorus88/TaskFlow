import React, { useState } from "react";
import "./TaskItem.css";
import EditTaskModal from "./EditTaskModal"; // Import de la modale

const TaskItem = ({
  task,
  onUpdateTask, // Ajoutez cette ligne
  onDeleteTask,
  onArchiveTask,
  onAddSubtask,
  onDeleteSubtask,
  isArchived,
}) => {
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [expanded, setExpanded] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false); // État pour gérer l'ouverture de la modale
  const [selectedTask, setSelectedTask] = useState(null); // État pour stocker la tâche en cours d'édition

  // Fonction pour ouvrir la modale
  const openEditModal = (task) => {
    setSelectedTask(task); // Définit la tâche à modifier
    setIsModalOpen(true); // Ouvre la modale
  };

  // Fonction pour fermer la modale
  const closeEditModal = () => {
    setSelectedTask(null); // Réinitialise la tâche sélectionnée
    setIsModalOpen(false); // Ferme la modale
  };

  // Fonction pour formater les dates au format jj.mm.aaaa
  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Calculer le pourcentage de progression des sous-tâches
  const calculateProgress = () => {
    const totalSubtasks = task.subtasks.length;
    const completedSubtasks = task.subtasks.filter((subtask) => subtask.completed).length;
    return totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
  };

  // Ajouter une sous-tâche
  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    onAddSubtask(task.id, {
      id: Date.now(),
      title: newSubtaskText,
      completed: false,
    });
    setNewSubtaskText("");
  };

  // Validation de la sous-tâche avec "Entrée"
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddSubtask();
    }
  };

  return (
    <li className="task-item">
      <div>
        <strong>{task.name}</strong>
        <p>Échéance : {formatDate(task.date)}</p>

        <p>
          <strong>Priorité :</strong> {task.priority === "low" ? "🟢 Faible" : task.priority === "medium" ? "🟠 Moyenne" : "🔴 Haute"}
        </p>

        {/* Affichage des catégories */}
        {task.categories && task.categories.length > 0 && (
          <p>
            <strong>Catégories :</strong> {task.categories.join(", ")}
          </p>
        )}

        {/* Affichage des données de temps */}
        <p>
          <strong>Temps total :</strong> {task.totalTime || 0} minutes
        </p>
        <p>
          <strong>Session en cours :</strong> {task.currentSessionTime || 0} minutes
        </p>

        {/* Barre de progression */}
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
        <p>Progression : {Math.round(calculateProgress())}%</p>
      </div>

      {/* Boutons d'action */}
      <div className="task-buttons">
        <button className="edit-button" onClick={() => openEditModal(task)}>
          Éditer
        </button>
        <button className="complete-button" onClick={() => onArchiveTask(task.id)}>
          Terminé
        </button>
        <button className="delete-button" onClick={() => onDeleteTask(task.id, isArchived)}>
          Supprimer
        </button>
      </div>

      {/* Sous-tâches */}
      <div>
        <button onClick={() => setExpanded(!expanded)}>
          {expanded ? "Masquer les sous-tâches" : "Voir les sous-tâches"}
        </button>

        {expanded && (
          <div className="subtasks-section">
            <h4>Sous-tâches :</h4>
            <ul className="subtask-list">
              {task.subtasks.map((subtask) => (
                <li key={subtask.id} className="subtask-item">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() =>
                      onAddSubtask(task.id, {
                        ...subtask,
                        completed: !subtask.completed,
                      })
                    }
                  />
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

            {/* Champ de saisie pour ajouter une sous-tâche */}
            <input
              type="text"
              value={newSubtaskText}
              onChange={(e) => setNewSubtaskText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Nouvelle sous-tâche..."
            />
          </div>
        )}
      </div>

      {/* Composant de modale */}
      {isModalOpen && (
        <EditTaskModal
          task={selectedTask} // Tâche actuelle
          onClose={closeEditModal} // Fonction pour fermer la modale
          onSave={(updatedTask) => {
            onUpdateTask(updatedTask.id, updatedTask); // Appelle la fonction de mise à jour avec l'ID et les champs mis à jour
            closeEditModal(); // Ferme la modale après la sauvegarde
          }}
        />
      )}
    </li>
  );
};

export default TaskItem;