import React, { useReducer, useEffect, useState, useCallback } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Archives from "./pages/Archives";
import FusionTool from "./pages/FusionTool"; // Importer le nouveau composant
import FloatingMenu from "./components/FloatingMenu";
import "./index.css";
import "./timer.css";
import taskReducer from "./reducers/taskReducer"; // Importer le reducer
import { TimerProvider } from "./context/TimerContext"; // Importer le TimerProvider

// Initial state
const initialState = {
  tasks: [],
  consumptionEntries: [], // Ajouter un état pour les entrées de consommation
};

const App = () => {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const [filter, setFilter] = useState({
    priority: "",
    date: "",
    status: "",
    sortOrder: "newest",
  });

  const [isDarkMode, setIsDarkMode] = useState(false); // État pour gérer le mode sombre

  // Utilisez useCallback pour mémoriser la fonction fetchTasks
  const fetchTasks = useCallback(async (archived = false) => {
    try {
      const response = await fetch(`http://192.168.50.241:4000/tasks?archived=${archived}`);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      console.log("fetchTasks - Tâches reçues :", data); // Ajoutez ce log
      if (!Array.isArray(data)) {
        console.error("Les données reçues ne sont pas un tableau :", data);
        return;
      }
      // On stocke les tâches dans le state
      dispatch({ type: "SET_TASKS", payload: data });
    } catch (error) {
      console.error("Erreur lors du chargement des tâches :", error);
      // On peut choisir de remettre un tableau vide en cas d'erreur
      dispatch({ type: "SET_TASKS", payload: [] });
    }
  }, []);

  // Add a new task
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

      const newTask = await response.json();
      console.log('Tâche ajoutée :', newTask);

      // Mettez à jour l'état local ou relancez le fetch global des tâches
      fetchTasks();
    } catch (error) {
      console.error('Erreur :', error);
    }
  };

  const updateTask = async (taskId, updatedFields) => {
    try {
      const response = await fetch(`http://192.168.50.241:4000/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFields),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la modification de la tâche.');
      }

      const updatedTask = await response.json();
      console.log('Tâche modifiée :', updatedTask);

      // Mettre à jour l'état local ou relancer le fetch global des tâches
      fetchTasks();
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

      console.log('Tâche supprimée.');
      fetchTasks(); // Rafraîchissez les données
    } catch (error) {
      console.error('Erreur :', error);
    }
  };

  const archiveTask = async (taskId) => {
    try {
      const response = await fetch(`http://192.168.50.241:4000/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ archivedAt: new Date().toISOString(), archived: 'closed' }), // Mise à jour du champ archived
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'archivage de la tâche.');
      }

      const updatedTask = await response.json();
      console.log('Tâche archivée :', updatedTask);

      // Mettre à jour l'état local ou relancer le fetch global des tâches
      fetchTasks();
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

      const updatedTask = await response.json();
      console.log('Sous-tâche ajoutée :', updatedTask);

      // Mettez à jour l'état local ou relancez le fetch global des tâches
      fetchTasks();
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

      const updatedTask = await response.json();
      console.log('Sous-tâche mise à jour :', updatedTask);

      // Mettez à jour l'état local ou relancez le fetch global des tâches
      fetchTasks();
    } catch (error) {
      console.error('Erreur :', error);
    }
  };

  const deleteSubtask = (taskId, subtaskId) => {
    dispatch({ type: "DELETE_SUBTASK", payload: { taskId, subtaskId } });
  };

  // Fetch consumption entries from the server
  const fetchConsumptionEntries = useCallback(async () => {
    try {
      const response = await fetch('http://192.168.50.241:4000/consumption-entries');
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      console.log("fetchConsumptionEntries - Entrées reçues :", data); // Ajoutez ce log
      if (!Array.isArray(data)) {
        console.error("Les données reçues ne sont pas un tableau :", data);
        return;
      }
      // On stocke les entrées de consommation dans le state
      dispatch({ type: "SET_CONSUMPTION_ENTRIES", payload: data });
    } catch (error) {
      console.error("Erreur lors du chargement des entrées de consommation :", error);
      // On peut choisir de remettre un tableau vide en cas d'erreur
      dispatch({ type: "SET_CONSUMPTION_ENTRIES", payload: [] });
    }
  }, []);

  // Add a new consumption entry
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

      const newEntry = await response.json();
      console.log('Entrée de consommation ajoutée :', newEntry);

      // Mettez à jour l'état local ou relancez le fetch global des entrées de consommation
      fetchConsumptionEntries();
    } catch (error) {
      console.error('Erreur :', error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchConsumptionEntries(); // Charger les entrées de consommation au démarrage
  }, [fetchTasks, fetchConsumptionEntries]);

  // Fonction pour basculer entre le mode clair et le mode sombre
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark', !isDarkMode);
  };

  // Fonction pour mettre à jour le temps d'une tâche
  const updateTaskTime = (taskId, updatedTask) => {
    console.log("Mise à jour de la tâche :", taskId, updatedTask); // Vérifie les données mises à jour
    dispatch({ type: "UPDATE_TASK_TIME", payload: { taskId, updatedTask } });
  };

  // Fonction pour définir la tâche sélectionnée
  const setSelectedTaskId = (taskId) => {
    dispatch({ type: "SET_SELECTED_TASK_ID", payload: taskId });
  };

  // --- Rendu ---
  return (
    <TimerProvider>
      <Router>
        <div className={`App ${isDarkMode ? 'dark' : ''}`}>
          <FloatingMenu addTask={addTask} />
          <button onClick={toggleDarkMode} className="dark-mode-toggle">
            {isDarkMode ? 'Mode Clair' : 'Mode Sombre'}
          </button>

          <Routes>
            <Route
              path="/"
              element={
                <Home
                  tasks={state.tasks.filter((task) => task.archived === "open")}
                  archivedTasks={state.tasks.filter((task) => task.archived === "closed")} // Passer les tâches archivées
                  onAddTask={addTask}
                  onEditTask={updateTask}
                  onDeleteTask={deleteTask}
                  onArchiveTask={archiveTask}
                  onAddSubtask={addSubtask}
                  onDeleteSubtask={deleteSubtask}
                  onToggleSubtaskStatus={toggleSubtaskStatus} // Ajoutez cette ligne
                  onSaveTask={updateTask}
                  filter={filter}
                  setFilter={setFilter}
                  fetchTasks={fetchTasks} // Passez la fonction fetchTasks
                  updateTaskTime={updateTaskTime} // Passez la fonction updateTaskTime
                  setSelectedTaskId={setSelectedTaskId} // Passez la fonction setSelectedTaskId
                />
              }
            />
            <Route
              path="/archives"
              element={
                <Archives
                  archivedTasks={state.tasks.filter((task) => task.archived?.trim() === "closed")}
                  handleDeleteTask={deleteTask}
                  onFetchArchivedTasks={() => fetchTasks(true)} // Ajoutez cette ligne pour passer la fonction de fetch
                />
              }
            />
            <Route
              path="/fusion-tool"
              element={
                <FusionTool
                  entries={state.consumptionEntries}
                  onAddEntry={addConsumptionEntry}
                />
              } // Ajoutez la nouvelle route pour FusionTool
            />
          </Routes>
        </div>
      </Router>
    </TimerProvider>
  );
};

export default App;