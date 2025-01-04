import React, { useState, useEffect, useCallback } from "react";
import TaskForm from "../components/TaskForm";
import TaskFilters from "../components/TaskFilters_home";
import TaskList from "../components/TaskList";
import EditTaskModal from "../components/EditTaskModal";
import WeatherWidget from "../components/WeatherWidget";
import Clock from "../components/Clock";
import Statistics from "../components/Statistics"; // Importer le composant Statistics
import PomodoroTimer from "../components/PomodoroTimer"; // Importer le composant PomodoroTimer
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
  updateTaskTime,
  setSelectedTaskId // Ajoutez cette ligne pour passer la fonction setSelectedTaskId
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

  // Fonction pour synchroniser immédiatement l'état local après une modification
  const handleUpdateTask = (updatedTask) => {
    updateTaskTime(updatedTask._id, updatedTask);
  };

  // Fonction pour ajouter une tâche et la sélectionner
  const handleAddTask = async (task) => {
    await onAddTask(task);
    setSelectedTaskId(task._id); // Sélectionner la nouvelle tâche
  };

  return (
    <div className="home-container">
      {/* Section supérieure : Horloge + Météo */}
      <header className="header-section">
        <h3>TaskFlow - V1.2.2 - <Clock /><WeatherWidget /></h3>
      </header>
      
      {/* Section centrale : Statistiques + Pomodoro */}
      <section className="stats-pomodoro-section">
        <Statistics tasks={tasks} archivedTasks={archivedTasks} />
        <PomodoroTimer
          tasks={tasks}
          updateTaskTime={updateTaskTime}
          fetchTasks={fetchTasks}
          setSelectedTaskId={setSelectedTaskId}
        />
      </section>

      {/* Section des tâches : Filtres, Formulaire, Liste */}
      <section className="tasks-section">
        <TaskFilters filter={filter} setFilter={setFilter} />
        <TaskForm onAddTask={handleAddTask} />
        <TaskList
          tasks={tasks.filter((task) => task.archived === 'open')} // Filtrer les tâches actives
          filter={filter} // Transmission de la prop filter pour le tri
          onEditTask={(task) => {
            setSelectedTask(task);
            setIsEditing(true);
          }}
          onSaveTask={onSaveTask}
          onDeleteTask={onDeleteTask}
          onArchiveTask={onArchiveTask}
          onAddSubtask={onAddSubtask}
          onDeleteSubtask={onDeleteSubtask}
          onToggleSubtaskStatus={onToggleSubtaskStatus}
          onUpdateTask={onSaveTask} 
        />
      </section>

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