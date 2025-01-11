import React, { useState } from "react";
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
  onToggleSubtaskStatus,
  isArchived = false,
  filter = {},
}) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fonction pour filtrer les tâches en fonction des filtres
  const filteredTasks = tasks.filter((task) => {
    if (filter.priority && task.priority !== filter.priority) {
      return false;
    }
    if (filter.date && task.date !== filter.date) {
      return false;
    }
    if (filter.status && task.status !== filter.status) {
      return false;
    }
    if (filter.search && filter.search.trim() !== "") {
      return task.name.toLowerCase().includes(filter.search.toLowerCase());
    }
    return true;
  });

  // Fonction pour trier les tâches par date d'ajout
  const sortedTasks = filteredTasks.sort((a, b) => {
    const dateA = new Date(a.addedAt);
    const dateB = new Date(b.addedAt);
    return filter.sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

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
    });
    setIsEditing(false);
    setSelectedTask(null);
    handleCloseModal();
  };

  return (
    <div className="task-list-container">
      <ul className="task-list">
        {sortedTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onEditTask={onEditTask}
            onSaveTask={onSaveTask}
            onDeleteTask={onDeleteTask}
            onArchiveTask={onArchiveTask}
            onAddSubtask={onAddSubtask}
            onDeleteSubtask={onDeleteSubtask}
            onToggleSubtaskStatus={onToggleSubtaskStatus}
            isArchived={isArchived}
          />
        ))}
      </ul>

      {isEditing && selectedTask && (
        <EditTaskModal
          task={selectedTask}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
};

export default TaskList;