import React, { useState } from "react";
import "./TaskItem.css";

const TaskItem = ({
  task,
  onEditTask,
  onDeleteTask,
  onArchiveTask,
  onAddSubtask,
  onDeleteSubtask,
  isArchived,
}) => {
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [expanded, setExpanded] = useState(false);

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
          <strong>Statut :</strong> {task.status === "open" ? "🟢 Open" : "🔴 Closed"}
        </p>

        <p>
          <strong>Priorité :</strong> {task.priority === "low" ? "🟢 Faible" : task.priority === "medium" ? "🟠 Moyenne" : "🔴 Haute"}
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
        <button className="edit-button" onClick={() => onEditTask(task)}>
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
                    onUpdateSubtask={() =>
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
    </li>
  );
};

export default TaskItem;
