import React, { useReducer, useEffect, useState, useCallback } from "react";
import { Routes, Route } from 'react-router-dom';
import Home from "./pages/Home";
import Archives from "./pages/Archives";
import FusionTool from "./pages/FusionTool";
import VersionHistory from "./pages/VersionHistory";
import Sessions from "./pages/Sessions";
import Settings from "./pages/Settings";
import "./index.css";
import taskReducer from "./reducers/taskReducer";
import { TimerProvider } from "./context/TimerContext";
import { SelectedTaskProvider } from './context/SelectedTaskContext'; // Importer le contexte
import AdditionalMenu from "./components/AdditionalMenu";
import "./App.css";
import GlobalPomodoroTimer from "./components/GlobalPomodoroTimer";


const initialState = {
  tasks: [],
  consumptionEntries: [],
  selectedTaskId: null
};

const App = () => {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const [] = useState({ message: '', type: '' });
  const [filter, setFilter] = useState({
    priority: "",
    date: "",
    status: "",
    sortOrder: "newest",
  });

    // Fonction pour formater l'heure
    const formatClock = (time) => {
      return time.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    };

      // Ajout de l'état pour l'heure actuelle
      const [currentTime, setCurrentTime] = useState(new Date());

      useEffect(() => {
        const timer = setInterval(() => {
          setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
      }, []);

  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const taskCategories = [
    "Travail 💼",
    "Personnel 🐈",
    "NewHorizon-FocusTime ⛳",
    "Courses 🛒",
    "Administratif 📑",
    "Projet 📈",
    "Finances 💵",
    "Jeux vidéos 🎮",
    "Maison 🏠",
    "Achats 🛒",
    "TaskFlow_app ⛩️",
    "Cuisine 🔪",
    "Manger 🥣",
    "Sport 🏋️",
    "Hygiène 🚿",
    "Développement personnel 🔋",
    "Formations 📚",
    "Famille 🙆",
    "Amis 🗿",
    "Bricolage 🛠️",
    "Lego 🧱",
    "Terasse 🌳",
    "FocusOnMe 🧘",
    "Musique 🎵",
    "Lecture 📖",
    "Film /Série /Youtube 🎬",
    "Informatique 🖥️",
    "Dormir - beta 😴",
    "Autre 📝",
  ];


  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(`http://192.168.50.241:4000/tasks`); // Récupérer toutes les tâches
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        console.error("Les données reçues ne sont pas un tableau :", data);
        return;
      }
      dispatch({ type: "SET_TASKS", payload: data });
    } catch (error) {
      console.error("Erreur lors du chargement des tâches :", error);
    }
  }, []);
  
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (task) => {
    try {
      const response = await fetch('http://192.168.50.241:4000/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout de la tâche.');
      }
      await fetchTasks();
    } catch (error) {
      console.error('Erreur :', error);
    }
  };

  const updateTask = async (taskId, updatedFields) => {
    try {
      const response = await fetch(`http://192.168.50.241:4000/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la modification de la tâche.');
      }
      await fetchTasks();
    } catch (error) {
      console.error('Erreur :', error);
    
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`http://192.168.50.241:4000/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la tâche.');
      }
      await fetchTasks();
    } catch (error) {
      console.error('Erreur :', error);
    }
  };

  const archiveTask = async (taskId) => {
    try {
      const response = await fetch(`http://192.168.50.241:4000/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archivedAt: new Date().toISOString(), archived: 'closed' }),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de l\'archivage de la tâche.');
      }
      await fetchTasks();
    } catch (error) {
      console.error('Erreur :', error);
    }
  };

  const addSubtask = async (taskId, subtask) => {
    try {
      const response = await fetch(`http://192.168.50.241:4000/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subtask),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout de la sous-tâche.');
      }
      await fetchTasks();
    } catch (error) {
      console.error('Erreur :', error);
    }
  };

  const toggleSubtaskStatus = async (taskId, subtaskId, status) => {
    try {
      const response = await fetch(`http://192.168.50.241:4000/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ archived: status }),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la sous-tâche.');
      }
      await fetchTasks();
    } catch (error) {
      console.error('Erreur :', error);
    }
  };
  
  const deleteSubtask = async (taskId, subtaskId) => {
    try {
      console.log(`Suppression de la sous-tâche ${subtaskId} de la tâche ${taskId}`);
      const response = await fetch(`http://192.168.50.241:4000/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur lors de la suppression de la sous-tâche :', errorText);
        throw new Error('Erreur lors de la suppression de la sous-tâche.');
      }
      await fetchTasks();
    } catch (error) {
      console.error('Erreur :', error);
    }
  };

  const fetchConsumptionEntries = useCallback(async () => {
    try {
      const response = await fetch('http://192.168.50.241:4000/consumption-entries');
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        console.error("Les données reçues ne sont pas un tableau :", data);
        return;
      }
      dispatch({ type: "SET_CONSUMPTION_ENTRIES", payload: data });
    } catch (error) {
      console.error("Erreur lors du chargement des entrées de consommation :", error);
      dispatch({ type: "SET_CONSUMPTION_ENTRIES", payload: [] });
    }
  }, []);

  const addConsumptionEntry = async (entry) => {
    try {
      const response = await fetch('http://192.168.50.241:4000/consumption-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout de l\'entrée de consommation.');
      }
      await fetchConsumptionEntries();
    } catch (error) {
      console.error('Erreur :', error);
    }
  };

  // Modification de deleteConsumptionEntry pour utiliser l'identifiant dans l'URL
  const deleteConsumptionEntry = async (id) => {
    try {
      const response = await fetch(`http://192.168.50.241:4000/consumption-entries/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l\'entrée de consommation.');
      }
      await fetchConsumptionEntries();
    } catch (error) {
      console.error('Erreur :', error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchConsumptionEntries();
  }, [fetchTasks, fetchConsumptionEntries]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark', !isDarkMode);
  };

  const updateTaskTime = async (taskId, session) => {
    try {
      const response = await fetch(`http://192.168.50.241:4000/tasks/${taskId}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
      });
      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout de la session.");
      }
      await fetchTasks();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du temps de la tâche :", error);
    }
  };

  return (
    <SelectedTaskProvider>
      <TimerProvider>
        <div className={`App ${isDarkMode ? 'dark' : ''}`}>
          <div className="app-title">
            
            <h3>
            <AdditionalMenu />
              TaskFlow 📬 1.4.0 
            
                 <button onClick={toggleDarkMode} className="dark-mode-button">
                {isDarkMode ? "🌚" : "🌞"}
              </button>
         
            </h3>
          </div>

          <section className="stats-pomodoro-section">
            <GlobalPomodoroTimer
              tasks={state.tasks.filter(task => task.status === 'open')}
              updateTaskTime={updateTaskTime}
              fetchTasks={fetchTasks}
              setSelectedTaskId={(taskId) => dispatch({ type: "SET_SELECTED_TASK_ID", payload: taskId })}
              onAddTask={addTask}
              taskCategories={taskCategories}
            />
          </section>
          

    
      


          <Routes>
            <Route
              path="/"
              element={
                <Home
                  tasks={state.tasks}
                  onAddTask={addTask}
                  onEditTask={updateTask}
                  onDeleteTask={deleteTask}
                  onArchiveTask={archiveTask}
                  onAddSubtask={addSubtask}
                  onDeleteSubtask={deleteSubtask}
                  onToggleSubtaskStatus={toggleSubtaskStatus}
                  onSaveTask={updateTask}
                  filter={filter}
                  setFilter={setFilter}
                  fetchTasks={fetchTasks}
                  updateTaskTime={updateTaskTime}
                  setSelectedTaskId={(taskId) => dispatch({ type: "SET_SELECTED_TASK_ID", payload: taskId })}
                  isDarkMode={isDarkMode}
                  toggleDarkMode={toggleDarkMode}
                  taskCategories={taskCategories}
                />
              }
            />
            <Route
              path="/archives"
              element={
                <Archives
                  archivedTasks={state.tasks.filter((task) => task.archived?.trim() === "closed")}
                  archivedSubtasksWithOpenParent={state.tasks.flatMap(task =>
                    task.subtasks.filter(subtask => subtask.archived === "closed" && task.archived !== "closed").map(subtask => ({
                      ...subtask,
                      parentTaskName: task.name,
                      parentTaskId: task._id,
                    }))
                  )}
                  onDeleteTask={deleteTask}
                  onDeleteSubtask={deleteSubtask}
                  onFetchArchivedTasks={() => fetchTasks(true)}
                  taskCategories={taskCategories}
                  isDarkMode={isDarkMode}
                  toggleDarkMode={toggleDarkMode}
                  setSelectedTaskId={(taskId) => dispatch({ type: "SET_SELECTED_TASK_ID", payload: taskId })}
                  onUpdateTask={updateTask}
                />
              }
            />
            <Route
              path="/fusion-tool"
              element={
                <FusionTool
                  entries={state.consumptionEntries}
                  onAddEntry={addConsumptionEntry}
                  onDeleteEntry={deleteConsumptionEntry}
                  isDarkMode={isDarkMode}
                  toggleDarkMode={toggleDarkMode}
                  onAddTask={addTask}
                  taskCategories={taskCategories}
                />
              }
            />
            <Route
              path="/sessions"
              element={
                <Sessions
                  tasks={state.tasks}
                  fetchTasks={fetchTasks}
                  isDarkMode={isDarkMode}
                  toggleDarkMode={toggleDarkMode}
                  onAddTask={addTask}
                  taskCategories={taskCategories}
                />
              }
            />
            <Route
              path="/VersionHistory"
              element={
                <VersionHistory
                  isDarkMode={isDarkMode}
                  toggleDarkMode={toggleDarkMode}
                />
              }
            />
            <Route path="/settings" element={<Settings />} /> {/* Add the new route */}
          </Routes>
        </div>
      </TimerProvider>
    </SelectedTaskProvider>
  );
};

export default App;