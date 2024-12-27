import React, { useState } from "react";
import Clock from "../components/Clock";
import TaskForm from "../components/TaskForm";
import TaskFilters from "../components/TaskFilters";
import TaskList from "../components/TaskList";
import EditTaskModal from "../components/EditTaskModal";
import PriorityPieChart from "../components/PriorityPieChart";
import WeatherWidget from "../components/WeatherWidget";

const Home = ({
  tasks = [], // Valeur par défaut pour éviter les erreurs
  archivedTasks = [], // Nouvelle prop avec une valeur par défaut
  onAddTask,
  onEditTask,
  onArchiveTask,
  onAddSubtask,
  onDeleteTask,
  onDeleteSubtask,
  onUpdateTaskStatus,
  filter,
  setFilter,
}) => {
  console.log("Home.js - Liste des tâches reçues :", tasks);

  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Obtenir la date du jour
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Calcul des statistiques
  const openTasks = tasks.filter((task) => task.status === "open").length;

  const completedTasksToday = archivedTasks.filter(
    (task) => task.archivedAt?.startsWith(getTodayDate())
  ).length;

  console.log("Tâches ouvertes :", openTasks);
  console.log("Tâches terminées aujourd'hui :", completedTasksToday);

  // Gestion de l'édition des tâches
  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsEditing(true);
  };

  const handleSaveTask = (updatedTask) => {
    onEditTask(updatedTask);
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

      {/* Section des statistiques */}
      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <h2>Statistiques des Tâches</h2>
        <p>Tâches ouvertes : {openTasks}</p>
        <p>Tâches terminées aujourd'hui : {completedTasksToday}</p>
        <PriorityPieChart tasks={tasks} />
      </div>

      {/* Formulaire pour ajouter une tâche */}
      <TaskForm onAddTask={onAddTask} />

      {/* Filtres pour les tâches */}
      <TaskFilters filter={filter} setFilter={setFilter} />

      {/* Liste des tâches */}
      <TaskList
        tasks={tasks}
        filter={filter} // Transmission de la prop filter pour le tri
        onEditTask={handleEditTask}
        onArchiveTask={onArchiveTask}
        onAddSubtask={onAddSubtask}
        onDeleteTask={onDeleteTask}
        onDeleteSubtask={onDeleteSubtask}
        onUpdateTaskStatus={onUpdateTaskStatus}
        isArchived={false} // Indique que ce sont des tâches normales
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
