import React, { useState, useEffect, useCallback } from "react";
import TaskForm from "../components/TaskForm";
import TaskFilters from "../components/TaskFilters_home";
import TaskList from "../components/TaskList";
import EditTaskModal from "../components/EditTaskModal";
import WeatherWidget from "../components/WeatherWidget";
import Clock from "../components/Clock";
import Statistics from "../components/Statistics";
import GlobalPomodoroTimer from "../components/GlobalPomodoroTimer"; // Importer le composant GlobalPomodoroTimer
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
  setSelectedTaskId
}) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchTasksCallback = useCallback(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchTasksCallback();
  }, [fetchTasksCallback]);

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
    setSelectedTaskId(task._id);
  };

  return (
    <div className="home-container">
      <header className="header-section">
        <h3>TaskFlow - V1.2.2 - <Clock /><WeatherWidget /></h3>
      </header>
      
      <section className="stats-pomodoro-section">
  <Statistics tasks={tasks} archivedTasks={archivedTasks} />
  <GlobalPomodoroTimer
    tasks={tasks}
    updateTaskTime={updateTaskTime}
    fetchTasks={fetchTasks}
    setSelectedTaskId={setSelectedTaskId}
  />
</section>

      <section className="tasks-section">
        <TaskFilters filter={filter} setFilter={setFilter} />
        <TaskForm onAddTask={handleAddTask} />
        <TaskList
          tasks={tasks.filter((task) => task.archived === 'open')}
          filter={filter}
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
        />
      )}
    </div>
  );
};

export default Home;