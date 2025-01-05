import React, { useReducer, useEffect, useState, useCallback } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Archives from "./pages/Archives";
import FusionTool from "./pages/FusionTool";
import Sessions from "./pages/Sessions";
import FloatingMenu from "./components/FloatingMenu";
import GlobalPomodoroTimer from "./components/GlobalPomodoroTimer";
import "./index.css";
import "./timer.css";
import taskReducer from "./reducers/taskReducer";
import { TimerProvider } from "./context/TimerContext";

const initialState = {
  tasks: [],
  consumptionEntries: [],
  selectedTaskId: null
};

const App = () => {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const [filter, setFilter] = useState({
    priority: "",
    date: "",
    status: "",
    sortOrder: "newest",
  });

  const [isDarkMode, setIsDarkMode] = useState(false);

  const fetchTasks = useCallback(async (archived = false) => {
    try {
      const response = await fetch(`http://192.168.50.241:4000/tasks?archived=${archived}`);
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
    fetchTasks(true); // Fetch archived tasks as well
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

  const deleteSubtask = (taskId, subtaskId) => {
    dispatch({ type: "DELETE_SUBTASK", payload: { taskId, subtaskId } });
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
    <TimerProvider>
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
                tasks={state.tasks} // Passer toutes les tâches sans filtre
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
              />
            }
          />
          <Route
            path="/archives"
            element={
              <Archives
                archivedTasks={state.tasks.filter((task) => task.archived?.trim() === "closed")}
                handleDeleteTask={deleteTask}
                onFetchArchivedTasks={() => fetchTasks(true)}
              />
            }
          />
          <Route path="/fusion-tool" element={<FusionTool entries={state.consumptionEntries} onAddEntry={addConsumptionEntry} />} />
          <Route path="/sessions" element={<Sessions />} />
        </Routes>
      </div>
    </TimerProvider>
  );
};

export default App;