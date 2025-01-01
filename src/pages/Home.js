import React, { useState, useEffect } from "react";
import TaskForm from "../components/TaskForm";
import TaskFilters from "../components/TaskFilters";
import TaskList from "../components/TaskList";
import EditTaskModal from "../components/EditTaskModal";
import PriorityPieChart from "../components/PriorityPieChart";
import WeatherWidget from "../components/WeatherWidget";
import Clock from "../components/Clock";
import Statistics from "../components/Statistics"; // Importer le composant Statistics
import "./Home.css";

const Home = ({
  tasks = [], // Valeur par défaut pour éviter les erreurs
  archivedTasks = [], // Ajouter les tâches archivées
  onAddTask, // Nouvelle prop sans valeur par défaut
  onEditTask,
  onDeleteTask,
  onArchiveTask,
  onAddSubtask,
  onDeleteSubtask, 
  onToggleSubtaskStatus, // Ajoutez cette ligne
  filter,
  setFilter,
  onSaveTask, // Assurez-vous que cette prop est correctement passée
  fetchTasks // Ajoutez cette ligne pour passer la fonction de fetch
}) => {
  console.log("Home.js - Liste des tâches reçues :", tasks);

  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Utilisez useEffect pour recharger les tâches lorsque le composant est monté
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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

      <h1>TaskFlow - V1.2.0
        
        <Clock />
        
      </h1>

      {/* Widget Météo */}
      <div
        style={{
          marginBottom: "20px",
          padding: "6px",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <WeatherWidget />
      </div>

      <div className="PriorityPieChart">
        <PriorityPieChart tasks={tasks} />
      </div>

      {/* Statistiques des tâches */}
      <Statistics tasks={tasks} archivedTasks={archivedTasks} />

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
        onToggleSubtaskStatus={onToggleSubtaskStatus} // Ajoutez cette ligne
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