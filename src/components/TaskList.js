import React, { useState } from "react";
import TaskDetail from "./TaskDetail";
import EditTaskModal from "./EditTaskModal";
import TaskItem from "./TaskItem";
import "./TaskList.css";

const TaskList = ({
  tasks,
  onAddSubtask,
  onDeleteSubtask,
  onEditTask,
  onDeleteTask,
  onSaveTask,
  onArchiveTask,
  onTaskComplete, // Nouvelle prop pour gérer la combinaison de "Terminé" et "Archiver"
  isArchived = false, // Indique si les tâches affichées sont des archives
  filter, // Ajout du filtre comme prop pour appliquer le tri
}) => {
  // Déclarations d'état
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Gérer la suppression d'une tâche avec un message de feedback
  const handleDeleteTask = (taskId) => {
    onDeleteTask(taskId, isArchived); // Ajout de `isArchived` pour gérer les tâches archivées
    setFeedbackMessage("Tâche supprimée avec succès !");
    setTimeout(() => setFeedbackMessage(""), 3000);
  };

  // Gérer la sauvegarde d'une tâche après édition
  const handleSaveTask = (updatedTask) => {
    onEditTask(updatedTask);
  };

  // Trier les tâches en fonction de filter.sortOrder (du plus récent au plus ancien)
  const sortedTasks = [...tasks].sort((a, b) => {
    if (filter.sortOrder === "newest") {
      return new Date(b.addedAt || 0) - new Date(a.addedAt || 0); // Du plus récent
    } else if (filter.sortOrder === "oldest") {
      return new Date(a.addedAt || 0) - new Date(b.addedAt || 0); // Du plus ancien
    }
    return 0; // Aucun tri si sortOrder n'est pas défini
  });

  return (
    <div className="task-list-container">
      {/* Affichage du message de feedback */}
      {feedbackMessage && <p className="feedback-message">{feedbackMessage}</p>}

      {/* Liste des tâches */}
      <ul className="task-list">
        {sortedTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onEditTask={onEditTask}
            onDeleteTask={handleDeleteTask}
            isArchived={isArchived} // Passez également l'état d'archivage
            onArchiveTask={onArchiveTask} // Transmettre onArchiveTask
            onTaskComplete={onTaskComplete} // Gestion du statut (open - closed)
            onAddSubtask={onAddSubtask}
            onDeleteSubtask={onDeleteSubtask}
          />
        ))}
      </ul>

      {/* Modale pour l'édition */}
      {isEditing && selectedTask && (
        <EditTaskModal
          task={selectedTask}
          onClose={() => setIsEditing(false)}
          onSave={handleSaveTask}
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
