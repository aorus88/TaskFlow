import React, { useReducer } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Archives from "./pages/Archives";
import taskReducer from "./reducers/taskReducer";
import FloatingMenu from "./components/FloatingMenu";
import "./index.css";
import "./timer.css";

// Initialisation de l'état global
const initialState = {
  tasks: JSON.parse(localStorage.getItem("tasks")) || [],
  archivedTasks: JSON.parse(localStorage.getItem("archivedTasks")) || [],
};

function App() {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Fonction pour ajouter une tâche
  const handleAddTask = (task) => dispatch({ type: "ADD_TASK", payload: task });

  // Fonction pour supprimer une tâche
  const handleDeleteTask = (taskId) => dispatch({ type: "DELETE_TASK", payload: taskId });

// Fonction pour éditer une tâche
const handleEditTask = (updatedTask) => {
  console.log("Mise à jour dans le reducer :", updatedTask); // Ajoutez un log uniquement après que la tâche mise à jour est reçue
  dispatch({ type: "EDIT_TASK", payload: updatedTask });
};

  // Fonction pour ajouter une sous-tâche
  const handleAddSubtask = (parentId, subtask) =>
    dispatch({ type: "ADD_SUBTASK", payload: { parentId, subtask } });

  // Fonction pour archive une tâche
  const handleArchiveTask = (taskId) => {
    const date = new Date();
    dispatch({
      type: "ARCHIVE_TASK",
      payload: { taskId, archivedAt: date.toISOString() },
    });
  };

  // Fonction pour supprimer une sous-tâche
  const handleDeleteSubtask = (taskId, subtaskId) =>
    dispatch({ type: "DELETE_SUBTASK", payload: { taskId, subtaskId } });

  // Fonction pour mettre à jour le temps passé sur une tâche
  const updateTaskTime = (taskId, timeSpent) =>
    dispatch({ type: "UPDATE_TASK_TIME", payload: { taskId, timeSpent } });

  // Gestion des filtres
  const [filter, setFilter] = React.useState({ priority: "", date: "", status: "" });

  // Filtrage des tâches
  const filteredTasks = React.useMemo(() => {
    return state.tasks.filter((task) => {
      const matchesPriority = !filter.priority || task.priority === filter.priority;
      const matchesDate = !filter.date || task.date === filter.date;
      const matchesStatus =
        !filter.status || (filter.status === "active" ? !task.archived : task.archived);
      return matchesPriority && matchesDate && matchesStatus;
    });
  }, [state.tasks, filter]);

  return (
    <Router>
    <div className="app-container">
      <FloatingMenu /> {/* Ajout du menu flottant */}
      <div className="content-container">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                tasks={filteredTasks}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onArchiveTask={handleArchiveTask}
                onAddSubtask={handleAddSubtask}
                onDeleteTask={handleDeleteTask}
                onDeleteSubtask={handleDeleteSubtask}
                filter={filter}
                setFilter={setFilter}
              />
            }
          />
          <Route
            path="/archives"
            element={<Archives archivedTasks={state.archivedTasks} />}
          />
          <Route path="*" element={<div>Page non trouvée</div>} />
        </Routes>
      </div>
    </div>
  </Router>
  );
}

export default App;
