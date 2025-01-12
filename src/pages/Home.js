import React, { useState, useEffect, useCallback } from "react";
import TaskForm from "../components/TaskForm";
import TaskFilters from "../components/TaskFilters_home";
import TaskList from "../components/TaskList";
import EditTaskModal from "../components/EditTaskModal";
import WeatherWidget from "../components/WeatherWidget";
import Clock from "../components/Clock";
import Statistics from "../components/Statistics";
import GlobalPomodoroTimer from "../components/GlobalPomodoroTimer";
import "./Home.css";

const Home = ({
  tasks = [],
  archivedTasks = [],
  onAddTask,
  onEditTask,
  onDeleteTask,
  onArchiveTask,
  onAddSubtask,
  onDeleteSubtask, 
  onToggleSubtaskStatus,
  filter,
  setFilter,
  onSaveTask,
  fetchTasks,
  updateTaskTime,
  setSelectedTaskId,
  isDarkMode,
  toggleDarkMode,
  taskCategories,
}) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchTasksCallback = useCallback(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchTasksCallback();
  }, [fetchTasksCallback]);

  useEffect(() => {
    console.log("Home.js - Tâches reçues :", tasks);
    console.log("Home.js - Tâches archivées reçues :", archivedTasks);
  }, [tasks, archivedTasks]);

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

  const handleUpdateTask = (updatedTask) => {
    updateTaskTime(updatedTask._id, updatedTask);
  };

  const handleAddTask = async (task) => {
    await onAddTask(task);
    setSelectedTaskId(task.id);
  };

  // Appliquer les filtres aux tâches
  const filteredTasks = tasks.filter((task) => {
    if (filter.priority && task.priority !== filter.priority) {
      return false;
    }
    if (filter.date && task.date !== filter.date) {
      return false;
    }
    if (filter.categories && !task.categories.includes(filter.categories)) {
      return task.categories.includes(filter.categories);
    }
    if (filter.search && !task.name.toLowerCase().includes(filter.search.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Trier les tâches filtrées
  const sortedTasks = filteredTasks.sort((a, b) => {
    const dateA = new Date(a.addedAt);
    const dateB = new Date(b.addedAt);
    return filter.sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="home-container">
      <header className="header-section">
        <WeatherWidget />
      </header>
      
      <section className="stats-pomodoro-section">
        <Statistics 
          tasks={tasks} 
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          setSelectedTaskId={setSelectedTaskId}
        />
        <GlobalPomodoroTimer
          tasks={tasks}
          updateTaskTime={updateTaskTime}
          fetchTasks={fetchTasks}
          setSelectedTaskId={setSelectedTaskId}
        />
      </section>

      <section className="tasks-section">
        <TaskFilters filter={filter} setFilter={setFilter} taskCategories={taskCategories} />
        <TaskForm onAddTask={handleAddTask} taskCategories={taskCategories} />
        <TaskList
          tasks={tasks.filter((task) => task.archived === 'open')}
          filter={filter}
          taskCategories={taskCategories} // Passer les catégories à TaskList
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

      {isEditing && selectedTask && (
        <EditTaskModal
          task={selectedTask}
          onClose={() => setIsEditing(false)}
          onSave={handleSaveTask}
          taskCategories={taskCategories}
        />
      )}
    </div>

  );
};

export default Home;