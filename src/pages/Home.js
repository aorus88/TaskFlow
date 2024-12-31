import React, { useState } from "react";
import TaskForm from "../components/TaskForm";
import TaskFilters from "../components/TaskFilters";
import TaskList from "../components/TaskList";
import EditTaskModal from "../components/EditTaskModal";
import PriorityPieChart from "../components/PriorityPieChart";
import WeatherWidget from "../components/WeatherWidget";
import Clock from "../components/Clock";

const Home = ({
  tasks = [], // Valeur par défaut pour éviter les erreurs
  onAddTask, // Nouvelle prop sans valeur par défaut
  onEditTask,
  onDeleteTask,
  onArchiveTask,
  onAddSubtask,
  onDeleteSubtask, 
  filter,
  setFilter,
  onSaveTask // Assurez-vous que cette prop est correctement passée
}) => {
  console.log("Home.js - Liste des tâches reçues :", tasks);

  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Gestion de l'édition des tâches
  const handleEditTask = async (taskId, updatedFields) => {
    try {
      await onEditTask(taskId, updatedFields);
    } catch (error) {
      console.error('Erreur dans Home.js :', error);
    }
  };

  const handleSaveTask = (updatedTask) => {
    onSaveTask(updatedTask.id, updatedTask);
    setIsEditing(false);
    setSelectedTask(null);
  };

  return (
    <div className="home-page">
      {/* Horloge */}
      <div>
        <Clock />
      </div>
      <h1>TaskFlow - V1.1.7_beta ❄️</h1>

      {/* Widget Météo */}
      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <WeatherWidget />
      </div>

      {/* Formulaire pour ajouter une tâche */}
      <TaskForm onAddTask={onAddTask} />

      {/* Filtres pour les tâches */}
      <TaskFilters filter={filter} setFilter={setFilter} />

      {/* Liste des tâches */}
      <TaskList
        tasks={tasks.filter((task) => task.archived === 'open')} // Filtrer les tâches actives
        filter={filter} // Transmission de la prop filter pour le tri
        onEditTask={onEditTask}
        onSaveTask={onSaveTask}
        onDeleteTask={onDeleteTask}
        onArchiveTask={onArchiveTask}
        onAddSubtask={onAddSubtask}
        onDeleteSubtask={onDeleteSubtask}
        onUpdateTask={onSaveTask} // Ajoutez cette ligne
      />

      {/* Modale pour éditer une tâche */}
      {isEditing && selectedTask && (
        <EditTaskModal
          task={selectedTask}
          onClose={() => setIsEditing(false)}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
};

export default Home;