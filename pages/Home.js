import React, { useState } from "react";
import TaskForm from "../components/TaskForm";
import TaskFilters from "../components/TaskFilters";
import TaskList from "../components/TaskList";
import EditTaskModal from "../components/EditTaskModal"; // Import de la modale

const Home = ({
  tasks,
  onAddTask,
  onEditTask, // Fonction pour sauvegarder les modifications dans App.js
  onArchiveTask,
  onAddSubtask,
  onDeleteTask,
  onDeleteSubtask,
  filter,
  setFilter,
}) => {
  const [selectedTask, setSelectedTask] = useState(null); // Tâche actuellement sélectionnée pour l'édition
  const [isEditing, setIsEditing] = useState(false); // État pour gérer l'ouverture/fermeture de la modale

  // Fonction appelée par le bouton "Éditer"
  const handleEditTask = (task) => {
    setSelectedTask(task); // Définit la tâche sélectionnée
    setIsEditing(true); // Ouvre la modale
  };

  // Fonction appelée par le bouton "Sauvegarder" dans la modale
  const handleSaveTask = (updatedTask) => {
    onEditTask(updatedTask); // Appelle la fonction parent pour sauvegarder les modifications
    setIsEditing(false); // Ferme la modale après sauvegarde
    setSelectedTask(null); // Réinitialise la tâche sélectionnée
  };

  return (
    <div className="home-page">
      <h1>TaskFlow - V1.1.4</h1>

      {/* Formulaire pour ajouter une tâche */}
      <TaskForm onAddTask={onAddTask} />

      {/* Filtres */}
      <TaskFilters filter={filter} setFilter={setFilter} />

      {/* Liste des tâches */}
      <TaskList 
        tasks={tasks}
        onEditTask={handleEditTask} // Appelle handleEditTask lors de l'édition
        onArchiveTask={onArchiveTask} // Transmettre à TaskList
        onAddSubtask={onAddSubtask}
        onDeleteTask={onDeleteTask}
        onDeleteSubtask={onDeleteSubtask}
      />

      {/* Modale pour l'édition */}
      {isEditing && selectedTask && (
        <EditTaskModal
          task={selectedTask} // Passe la tâche actuellement sélectionnée
          onClose={() => setIsEditing(false)} // Ferme la modale
          onSave={handleSaveTask} // Sauvegarde les modifications
        />
      )}
    </div>
  );
};

export default Home;
