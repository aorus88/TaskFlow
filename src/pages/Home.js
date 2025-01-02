import React, { useState, useEffect, useCallback } from "react";
import TaskForm from "../components/TaskForm";
import TaskFilters from "../components/TaskFilters";
import TaskList from "../components/TaskList";
import EditTaskModal from "../components/EditTaskModal";
import PriorityPieChart from "../components/PriorityPieChart";
import WeatherWidget from "../components/WeatherWidget";
import Clock from "../components/Clock";
import Statistics from "../components/Statistics"; // Importer le composant Statistics
import GlobalPomodoroTimer from "../components/GlobalPomodoroTimer"; // Importer le composant GlobalPomodoroTimer
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
  fetchTasks, // Ajoutez cette ligne pour passer la fonction de fetch
  updateTaskTime // Ajoutez cette ligne pour passer la fonction updateTaskTime
}) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Utilisez useCallback pour mémoriser la fonction fetchTasks
  const fetchTasksCallback = useCallback(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Utilisez useEffect pour recharger les tâches lorsque le composant est monté
  useEffect(() => {
    fetchTasksCallback();
  }, [fetchTasksCallback]);

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
      <div className="header">
        <h2>TaskFlow - V1.2.1</h2>
        <Clock />
      </div>

      <div className="main-content">
        {/* Widget Météo */}
        <div className="widget-container">
          <WeatherWidget />
        </div>

        <div className="widget-container">
          <PriorityPieChart tasks={tasks} />
        </div>

        {/* Statistiques des tâches */}
        <div className="widget-container">
          <Statistics tasks={tasks} archivedTasks={archivedTasks} />
        </div>
      </div>

      {/* Formulaire pour ajouter une tâche */}
      <div className="task-form">
        <TaskForm onAddTask={onAddTask} />
      </div>

      {/* Filtres pour les tâches */}
      <div className="task-filters">
        <TaskFilters filter={filter} setFilter={setFilter} />
      </div>

      {/* Minuteur Pomodoro */}
      <div className="global-pomodoro-timer">
        <GlobalPomodoroTimer tasks={tasks} updateTaskTime={updateTaskTime} />
      </div>

      {/* Liste des tâches */}
      <div className="task-list">
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
      </div>

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