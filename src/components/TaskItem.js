import React, { useState, useEffect } from "react";
import "./TaskItem.css";
import EditTaskModal from "./EditTaskModal"; // Import de la modale

const TaskItem = ({
  task,
  onUpdateTask,
  onDeleteTask,
  onArchiveTask,
  onAddSubtask,
  onDeleteSubtask,
  onToggleSubtaskStatus,
  isArchived,
}) => {
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [expanded, setExpanded] = useState(false); // Initialiser expanded à false
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [hiddenSubtasks, setHiddenSubtasks] = useState([]);

  const openEditModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedTask(null);
    setIsModalOpen(false);
  };

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    onAddSubtask(task.id, {
      id: Date.now(),
      name: newSubtaskText,
      completed: false,
      archived: "open",
    });
    setNewSubtaskText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddSubtask();
    }
  };

  useEffect(() => {
    const savedHiddenSubtasks = JSON.parse(localStorage.getItem(`hiddenSubtasks-${task.id}`)) || [];
    setHiddenSubtasks(savedHiddenSubtasks);
  }, [task.id]);

  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const calculateProgress = () => {
    const totalSubtasks = task.subtasks.length;
    const completedSubtasks = task.subtasks.filter((subtask) => subtask.archived === "closed").length;
    return totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const lastSessionDuration = task.sessions && task.sessions.length > 0
    ? task.sessions[task.sessions.length - 1].duration
    : 0;

  const handleToggleSubtaskStatus = (taskId, subtaskId, status) => {
    onToggleSubtaskStatus(taskId, subtaskId, status);
    if (status === "closed") {
      setTimeout(() => {
        setHiddenSubtasks((prev) => {
          const updatedHiddenSubtasks = [...prev, subtaskId];
          localStorage.setItem(`hiddenSubtasks-${taskId}`, JSON.stringify(updatedHiddenSubtasks));
          return updatedHiddenSubtasks;
        });
      }, 5000); // Masquer la sous-tâche après 5 secondes
    }
  };

  const handleDeleteSubtask = (taskId, subtaskId) => {
    onDeleteSubtask(taskId, subtaskId);
  };

  return (
    <li className="task-item">
      <div className="task-content">
        <div className="task-item-header">
          <strong className="task-name">{task.name}</strong>
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
        </div>
        <p>Échéance : {formatDate(task.date)}</p>
        <p>
          <strong>Priorité :</strong> {task.priority === "low" ? "🟢 Faible" : task.priority === "medium" ? "🟠 Moyenne" : "🔴 Haute"}
        </p>
        {task.categories && task.categories.length > 0 && (
          <p>
            <strong>Catégories :</strong> {task.categories.join(", ")}
          </p>
        )}
        <p>
          <strong>Total sessions :</strong> {formatTime(task.totalTime || 0)}
        </p>
        <p>
          <strong>Dernière session :</strong> {formatTime(lastSessionDuration)}
        </p>

        <div className="progress-bar-taskitem">
          <div
            className="progress-bar-taskitem-fill"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
        <p>Progression : {Math.round(calculateProgress())}%</p>

        
        {task.subtasks.length > 0 && (
          <div className="subtasks-section">
            <button onClick={() => setExpanded(!expanded)}>
              {expanded ? "Masquer les sous-tâches" : "Voir les sous-tâches"}
            </button>
            {expanded && (
              <div className="subtask-list">
                {task.subtasks.map((subtask) => (
                  !hiddenSubtasks.includes(subtask.id) && (
                    <div key={subtask.id} className="subtask-item">
                      <input
                        type="checkbox"
                        checked={subtask.archived === "closed"}
                        onChange={() => handleToggleSubtaskStatus(task.id, subtask.id, subtask.archived === "open" ? "closed" : "open")}
                      />
                      {subtask.name}
                      <button className="edit-icon" onClick={() => openEditModal(subtask)}>
                        ✏️
                      </button>
                      <button className="delete-icon" onClick={() => handleDeleteSubtask(task.id, subtask.id)}>
                        🗑️
                      </button>
                    </div>
                  )
                ))}
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
      </div>
    </li>
  );
};

export default TaskItem;