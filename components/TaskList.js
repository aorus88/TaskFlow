import React, { useState } from "react";
import TaskDetail from "./TaskDetail";
import EditTaskModal from "./EditTaskModal";
import "./TaskList.css";

const TaskList = ({
  tasks,
  onAddSubtask,
  onDeleteSubtask,
  onEditTask,
  onDeleteTask,
  onSaveTask,
  onArchiveTask,
}) => {
  // Déclarations d'état
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  // Fonction pour formater les dates au format jj.mm.aaaa
  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Gérer la suppression d'une tâche
  const handleDeleteTask = (taskId) => {
    onDeleteTask(taskId);
    setFeedbackMessage("Tâche supprimée avec succès !");
    setTimeout(() => setFeedbackMessage(""), 3000);
  };

  // Gérer la sauvegarde d'une tâche après édition
  const handleSaveTask = (updatedTask) => {
    onEditTask(updatedTask);
  };

  // Ajouter une sous-tâche
  const handleAddSubtask = (taskId) => {
    if (!newSubtaskText.trim()) return;
    onAddSubtask(taskId, {
      id: Date.now(),
      title: newSubtaskText,
      completed: false,
    });
    setNewSubtaskText("");
  };

  // Validation de la sous-tâche avec "Entrée"
  const handleKeyPress = (e, taskId) => {
    if (e.key === "Enter") {
      handleAddSubtask(taskId);
    }
  };

  return (
    <div className="task-list-container">
      {/* Affichage du message de feedback */}
      {feedbackMessage && <p className="feedback-message">{feedbackMessage}</p>}

      {/* Liste des tâches */}
      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className="task-item">
            <div>
              <strong>{task.name}</strong>
              <p>Échéance : {formatDate(task.date)}</p>
              <p>
                Priorité :{" "}
                {task.priority === "low" && "🟢 Faible"}
                {task.priority === "medium" && "🟠 Moyenne"}
                {task.priority === "high" && "🔴 Haute"}
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="task-buttons">
              <button
                className="edit-button"
                onClick={() => onEditTask(task)}
              >
                Éditer
              </button>
              <button
                className="complete-button"
                onClick={() => onArchiveTask(task.id)}
              >
                Terminé
              </button>
              <button
                className="delete-button"
                onClick={() => handleDeleteTask(task.id)}
              >
                Supprimer
              </button>
            </div>

            {/* Sous-tâches */}
            <div>
              <button
                onClick={() =>
                  setExpandedTaskId(
                    expandedTaskId === task.id ? null : task.id
                  )
                }
              >
                {expandedTaskId === task.id
                  ? "Masquer les sous-tâches"
                  : "Voir les sous-tâches"}
              </button>

              {expandedTaskId === task.id && (
                <div className="subtasks-section">
                  <h4>Sous-tâches :</h4>
                  <ul className="subtask-list">
                    {task.subtasks.map((subtask) => (
                      <li key={subtask.id} className="subtask-item">
                        {subtask.title}
                        <button
                          className="delete-button"
                          onClick={() =>
                            onDeleteSubtask(task.id, subtask.id)
                          }
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
                    onKeyDown={(e) => handleKeyPress(e, task.id)}
                    placeholder="Nouvelle sous-tâche..."
                  />
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Modale pour l'édition */}
      {isEditing && selectedTask && (
        <EditTaskModal
          task={selectedTask}
          onClose={() => setIsEditing(false)}
          onSave={onSaveTask}
        />
      )}

      {/* Affichage des détails de la tâche sélectionnée */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onAddSubtask={onAddSubtask}
          onDeleteSubtask={onDeleteSubtask}
        />
      )}
    </div>
  );
};

export default TaskList;
