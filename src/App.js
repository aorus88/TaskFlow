import React, { useReducer, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Archives from "./pages/Archives";
import taskReducer from "./reducers/taskReducer";
import FloatingMenu from "./components/FloatingMenu";
import "./index.css";
import "./timer.css";

// State initial (vide, car on va charger depuis le serveur)
const initialState = {
  tasks: [],
};

const App = () => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  const fetchTasks = async () => {
    try {
      const response = await fetch("http://192.168.50.241:4000/tasks");
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
  };

  // Chargement des tâches depuis le backend au montage du composant
  useEffect(() => {
    fetchTasks();
  }, []);

  // --- Fonctions dispatch ---

  // Fonction pour ajouter une tâche
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

  // Fonction pour modifier une tâche existante
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

  // Fonction pour archiver une tâche existante
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

  // Fonction pour supprimer une tâche existante
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

  const addSubtask = (parentId, subtask) => {
    dispatch({ type: "ADD_SUBTASK", payload: { parentId, subtask } });
  };

  const deleteSubtask = (taskId, subtaskId) => {
    dispatch({ type: "DELETE_SUBTASK", payload: { taskId, subtaskId } });
  };

  // --- Rendu ---
  return (
    <Router>
      <div className="App">
        <FloatingMenu addTask={addTask} />

        <Routes>
          <Route
            path="/"
            element={
              <Home
                tasks={state.tasks.filter((task) => task.archived === 'open')}
                onAddTask={addTask}
                onEditTask={updateTask}
                onDeleteTask={deleteTask}
                onArchiveTask={archiveTask}
                onAddSubtask={addSubtask}
                onDeleteSubtask={deleteSubtask}
                onSaveTask={updateTask}
              />
            }
          />
          <Route
            path="/archives"
            element={
              <Archives
                archivedTasks={state.tasks.filter((task) => task.archived === 'closed')} // Correction ici
                handleDeleteTask={deleteTask}
                onFetchArchivedTasks={fetchTasks} // Ajoutez cette ligne pour passer la fonction de fetch
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;