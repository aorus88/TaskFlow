import React, { useState, useEffect } from "react";
import "./TaskItem.css";
import EditTaskModal from "./EditTaskModal"; // Import de la modale
import TaskDetailsModal from "./TaskDetailsModal"; // Import de la nouvelle modale

const TaskItem = ({
  task,
  onUpdateTask,
  onDeleteTask,
  onArchiveTask,
  onAddSubtask,
  onDeleteSubtask,
  onToggleSubtaskStatus,
  isArchived,
  taskCategories,
  isCompactView, // Ajout de la prop pour le mode d'affichage
}) => {

  // Fonction pour calculer la progression
  const calculateProgress = () => {
    const totalSubtasks = task.subtasks.length;
    const completedSubtasks = task.subtasks.filter((subtask) => subtask.archived === "closed").length;
    return totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
  };

  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [expanded, setExpanded] = useState(false); // Initialiser expanded à false
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [hiddenSubtasks, setHiddenSubtasks] = useState([]);
  const [progress, setProgress] = useState(calculateProgress()); // Ajoute un état pour la progression
  const [isCompleted, setIsCompleted] = useState(false); // Ajoute un état pour indiquer si la tâche est terminée
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Sons de notification
const NOTIFICATION_SOUNDS = {
  sessionComplete: '/sounds/session-complete.mp3',
};

const playSound = (soundType) => {
  try {
    const audio = new Audio(NOTIFICATION_SOUNDS[soundType]);
    audio.play().catch(error => {
      console.warn("Erreur lors de la lecture du son:", error);
    });
  } catch (error) {
    console.warn("Le navigateur ne supporte pas la lecture audio:", error);
  }
};

///////////////////////////////////////////////////////////////////////////////////////////


    // Fonction pour calculer les jours restants
    const calculateDaysRemaining = () => {
      if (!task.date) return { text: "Pas de date", className: "no-date" };
    
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(task.date);
      dueDate.setHours(0, 0, 0, 0);
    
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
      if (diffDays < 0) return { text: "En retard", className: "overdue" };
      if (diffDays === 0) return { text: "Aujourd'hui", className: "today" };
      if (diffDays === 1) return { text: "Demain", className: "tomorrow" };
      return { text: `${diffDays} jours restants`, className: "remaining" };
    };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedTask(null);
    setIsModalOpen(false);
  };

  const openDetailsModal = () => {
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
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
      }, 10000); // Masquer la sous-tâche après 10 secondes (10000 ms)
    }
  };

  const handleDeleteSubtask = (taskId, subtaskId) => {
    onDeleteSubtask(taskId, subtaskId);
  };

  // Mise à jour de calculateTotalTime
const calculateTotalTime = (task) => {
  if (!task.sessions) return 0;
  
  let total = 0;
  
  // Sessions de la tâche principale
  const taskSessions = task.sessions.filter(s => !s.type || s.type === 'task');
  total += taskSessions.reduce((acc, session) => acc + session.duration, 0);
  
  // Sessions des sous-tâches
  const subtaskSessions = task.sessions.filter(s => s.type === 'subtask');
  total += subtaskSessions.reduce((acc, session) => acc + session.duration, 0);
  
  return total;
};

// 2. Ajout d'une fonction pour calculer le temps par sous-tâche
const calculateSubtaskTime = (task, subtaskId) => {
  const subtaskSessions = task.sessions.filter(s =>
    s.type === 'subtask' && s.targetId === subtaskId
  );
  return subtaskSessions.reduce((acc, session) => acc + (session.duration || 0), 0);
};

const handleArchiveTask = () => {
  onArchiveTask(task.id);
  playSound('sessionComplete'); // Ajouter le son ici
  setProgress(100); // Remplir la barre de progression
  setIsCompleted(true); // Indiquer que la tâche est terminée
  setTimeout(() => {
    onArchiveTask(task.id);
  }, 10000); // Délai de 10 secondes (2000 ms) avant d'archiver définitivement
};

  return (
    <li className={`task-item ${isCompactView ? "compact-view" : ""}`}>
      <div className="task-content">
        <div className="task-item-header">
          <strong className="task-name">{task.name}</strong>
          <div className="task-buttons">
            <button className="edit-button" onClick={() => openEditModal(task)}>
              Éditer
            </button>
            <button className="complete-button" onClick={handleArchiveTask}>
              Terminé
            </button>
            <button className="delete-button" onClick={() => onDeleteTask(task.id, isArchived)}>
              Supprimer
            </button>
            <button className="details-button" onClick={openDetailsModal}>
              Détails
            </button>
          </div>
        </div>
        {!isCompactView && (
          <>
            <div className="task-content"></div>
            Échéance : {
              (() => {
                const daysRemaining = calculateDaysRemaining();
                return <span className={daysRemaining.className}>{daysRemaining.text}</span>;
              })()
            }

            <p>
              <strong>Priorité :</strong> {task.priority === "low" ? "🟢 Faible" : task.priority === "medium" ? "🟠 Moyenne" : "🔴 Haute"}
            </p>
            {task.categories && task.categories.length > 0 && (
              <p>
                <strong>Catégories :</strong> {task.categories.join(", ")}
              </p>
            )}
            <p>
              <strong>Temps total :</strong> {formatTime(calculateTotalTime(task))}
            </p>
            <p>
              <strong>Dernière session :</strong> {formatTime(lastSessionDuration)}
            </p>

            <div className="progress-bar-taskitem">
              <div
                className="progress-bar-taskitem-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p>Progression : {Math.round(progress)}%</p>


            {task.subtasks.length > 0 && (
              <div className="subtasks-section">
                <button onClick={() => setExpanded(!expanded)}>
                  {expanded ? "Masquer les sous-tâches" : "Voir les sous-tâches"}
                </button>
                {expanded && (
                  <div className="subtask-list">
                    {task.subtasks
                      .filter((subtask) => subtask.archived === "open")
                      .map((subtask) => (
                        !hiddenSubtasks.includes(subtask.id) && (
                          <div key={subtask.id} className="subtask-item">
                            <input
                              type="checkbox"
                              checked={subtask.archived === "closed"}
                              onChange={() => handleToggleSubtaskStatus(task.id, subtask.id, subtask.archived === "open" ? "closed" : "open")}
                            />

                            {subtask.name} /{" "}
                            <span className="subtask-time">
                              {formatTime(calculateSubtaskTime(task, subtask._id))}
                            </span>
                            <button className="edit-icon" onClick={() => openEditModal(subtask)}>
                              ✏️
                            </button>
                            <button className="delete-icon" onClick={() => handleDeleteSubtask(task.id, subtask.id)}>
                             ❌
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
          </>
        )}
      {isModalOpen && (
        <EditTaskModal
          task={selectedTask} // Tâche actuelle
          taskCategories={taskCategories} // Catégories de tâches
          onClose={closeEditModal} // Fonction pour fermer la modale
          onSave={(updatedTask) => {
            onUpdateTask(updatedTask.id, updatedTask); // Appelle la fonction de mise à jour avec l'ID et les champs mis à jour
            closeEditModal(); // Ferme la modale après la sauvegarde
          
            }}
          />
        )}
      {isDetailsModalOpen && (
        <TaskDetailsModal
          task={task}
          onClose={closeDetailsModal}
        />
      )}
      </div>
    </li>
  );
};

export default TaskItem;