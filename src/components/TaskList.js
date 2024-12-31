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
  filter, // Ajout du filtre pour gérer les recherches ou tri
}) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fonction pour filtrer les tâches en fonction du texte de recherche
  const filteredTasks = filter
    ? tasks.filter((task) => task.name.toLowerCase().includes(filter.toLowerCase()))
    : tasks;

  // Gestion de l'ouverture de la modale d'édition
  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsEditing(true);
  };

  // Gestion de la fermeture de la modale d'édition
  const handleCloseModal = () => {
    setIsEditing(false);
    setSelectedTask(null);
  };

  // Gestion de la sauvegarde des modifications de tâche
  const handleSaveTask = (updatedTask) => {
    onSaveTask(updatedTask.id, {
      name: updatedTask.name,
      date: updatedTask.date,
      priority: updatedTask.priority,
      // ...et tout ce que tu veux mettre à jour
    });
    setIsEditing(false);
    setSelectedTask(null);
    // Puis on ferme la modale
    handleCloseModal();
  };

  return (
    <div className="task-list">
      <ul>
        {filteredTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onEditTask={onEditTask}
            onSaveTask={onSaveTask}
            onDeleteTask={onDeleteTask}
            onArchiveTask={onArchiveTask}
            onAddSubtask={onAddSubtask}
            onDeleteSubtask={onDeleteSubtask}
            onUpdateTask={onSaveTask} // Ajoutez cette ligne
            isArchived={isArchived}
          />
        ))}
      </ul>

      {/* Modale d'édition */}
      {isEditing && selectedTask && (
        <EditTaskModal
          task={selectedTask}
          onClose={handleCloseModal}
          onSave={onSaveTask}  
          /* ICI on transmet handleSaveTask */
        />
      )}
    </div>
  );
};

export default TaskList;