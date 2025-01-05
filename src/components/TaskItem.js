import React, { useState, useEffect } from "react";
import "./TaskItem.css";
import EditTaskModal from "./EditTaskModal"; // Import de la modale

const TaskItem = ({
  task,
  onUpdateTask, // Ajoutez cette ligne
  onDeleteTask,
  onArchiveTask,
  onAddSubtask,
  onDeleteSubtask,
  onToggleSubtaskStatus, // Ajoutez cette ligne
  isArchived,
}) => {

  // Utilisez useEffect pour afficher un message lorsque la tâche est mise à jour
  useEffect(() => {
    console.log("Task updated:", task);
  }, [task]);

   // Ajouter la fonction de formatage de temps (hh:mm)
   const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };
  

  // Récupérer la durée de la dernière session
  const lastSessionDuration = task.sessions && task.sessions.length > 0
    ? task.sessions[task.sessions.length - 1].duration
    : 0;

  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [expanded, setExpanded] = useState(false); // État pour gérer l'expansion des sous-tâches

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
    const completedSubtasks = task.subtasks.filter((subtask) => subtask.archived === "closed").length;
    return totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
  };

  // Fonction pour vérifier l'unicité des sous-tâches
  const isSubtaskUnique = (task, subtaskName) => {
    return !task.subtasks.some(subtask => subtask.name === subtaskName);
  };

  // Ajouter une sous-tâche
  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    if (isSubtaskUnique(task, newSubtaskText)) {
      onAddSubtask(task.id, {
        id: Date.now(),
        name: newSubtaskText,
        completed: false,
        archived: "open", // Nouveau champ
      });
      setNewSubtaskText("");
    } else {
      console.error('La sous-tâche existe déjà.');
    }
  };

  // Validation de la sous-tâche avec "Entrée"
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddSubtask();
    }
  };

  // Utilisez useEffect pour initialiser expanded à true si des sous-tâches existent
  useEffect(() => {
    if (task.subtasks.length > 0) {
      setExpanded(true);
    }
  }, [task.subtasks.length]);

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
          <strong>Total sessions :</strong> {formatTime(task.totalTime || 0)}
        </p>
        <p>
          <strong>Dernière session :</strong> {formatTime(lastSessionDuration)}
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
      {task.subtasks.length > 0 && (
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
                      checked={subtask.archived === "closed"}
                      onChange={() => onToggleSubtaskStatus(task.id, subtask.id, subtask.archived === "open" ? "closed" : "open")}
                    />
                    {subtask.name}
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
      )}

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