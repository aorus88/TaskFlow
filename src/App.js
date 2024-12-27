import React, { useReducer, useState, useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Archives from "./pages/Archives";
import taskReducer from "./reducers/taskReducer";
import FloatingMenu from "./components/FloatingMenu";
import "./index.css";
import "./timer.css";

// On commence avec un state vide,
// car désormais on va charger depuis le serveur plutôt que localStorage.
const initialState = {
  tasks: [],
  archivedTasks: [],
};

function App() {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Ajout de l'état pour les messages de feedback
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // ---------------------------------------------
  // 1. Au montage, on charge les tâches depuis l'API
  // ---------------------------------------------
  useEffect(() => {
    fetchTasksFromServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fonction utilitaire pour récupérer les tâches depuis le back-end
  const fetchTasksFromServer = async () => {
    try {
      const res = await fetch("http://192.168.50.241:4000/tasks");
      const data = await res.json();
      // On dispatch une action spéciale "SET_TASKS" (à définir dans ton reducer)
      dispatch({ type: "SET_TASKS", payload: data });
      console.log("Tâches récupérées depuis le serveur :", data);
    } catch (error) {
      console.error("Erreur lors de la récupération des tâches :", error);
    }
  };

  // ---------------------------------------------
  // 2. handleAddTask -> envoi au back, puis dispatch
  // ---------------------------------------------
  const handleAddTask = async (task) => {
    try {
      // On envoie la nouvelle tâche au back-end
      const res = await fetch("http://192.168.50.241:4000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });
      const createdTask = await res.json();

      // Une fois créée côté serveur, on dispatch localement
      dispatch({ type: "ADD_TASK", payload: createdTask });
      console.log("Tâche créée côté back-end :", createdTask);

      setFeedbackMessage("Tâche ajoutée avec succès !");
      setTimeout(() => setFeedbackMessage(""), 3000);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la tâche :", error);
      setFeedbackMessage("Erreur lors de l'ajout de la tâche !");
    }
  };

  // ---------------------------------------------
  // 3. handleDeleteTask -> DELETE /tasks/:id (ou autre route)
  // ---------------------------------------------
  const handleDeleteTask = async (taskId, isArchived = false) => {
    // S'il s'agit d'une tâche archivée, on peut prévoir un endpoint différent
    // ou la même route selon ton API. On part du principe qu'on la supprime pareil.
    try {
      await fetch(`http://192.168.50.241:4000/tasks/${taskId}`, {
        method: "DELETE",
      });
      // Ensuite, on dispatch localement pour mettre à jour l'état
      if (isArchived) {
        dispatch({ type: "DELETE_ARCHIVED_TASK", payload: taskId });
      } else {
        dispatch({ type: "DELETE_TASK", payload: taskId });
      }

      setFeedbackMessage("Tâche supprimée avec succès !");
      setTimeout(() => setFeedbackMessage(""), 3000);

      console.log(
        `Tâche avec ID ${taskId} supprimée ${
          isArchived ? "(archivée)" : "(normale)"
        }`
      );
    } catch (error) {
      console.error("Erreur lors de la suppression de la tâche :", error);
      setFeedbackMessage("Erreur lors de la suppression !");
    }
  };

  // ---------------------------------------------
  // 4. handleEditTask -> PUT /tasks/:id
  // ---------------------------------------------
  const handleEditTask = async (updatedTask) => {
    console.log("Mise à jour vers le back-end :", updatedTask);

    try {
      // On suppose que updatedTask contient un champ "id" (ou "_id")
      await fetch(`http://192.168.50.241:4000/tasks/${updatedTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });
      // On ne récupère pas forcément la réponse, mais on peut si besoin
      // const result = await res.json();

      // On met à jour dans le state local
      dispatch({ type: "EDIT_TASK", payload: updatedTask });

      setFeedbackMessage("Modification enregistrée avec succès !");
      setTimeout(() => setFeedbackMessage(""), 3000);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la tâche :", error);
      setFeedbackMessage("Erreur lors de la modification de la tâche !");
    }
  };

  // ---------------------------------------------
  // 5. handleAddSubtask -> ex. PUT /tasks/:id/subtasks
  //    (ou POST /tasks/:id/subtasks, à toi de voir)
  // ---------------------------------------------
  const handleAddSubtask = async (parentId, subtask) => {
    try {
      // On appelle une route style POST /tasks/:id/subtasks
      // ou alors on récupère d'abord la tâche, on la modifie côté back, etc.
      const res = await fetch(
        `http://192.168.50.241:4000/tasks/${parentId}/subtasks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subtask),
        }
      );
      const updatedTask = await res.json();

      // On dispatch localement pour rafraîchir le state
      // (Ici, "UPDATED_TASK" ou "EDIT_TASK" selon ton reducer)
      dispatch({ type: "EDIT_TASK", payload: updatedTask });
    } catch (error) {
      console.error("Erreur lors de l'ajout de sous-tâche :", error);
    }
  };

  // ---------------------------------------------
  // 6. handleDeleteSubtask -> ex. DELETE /tasks/:id/subtasks/:subtaskId
  // ---------------------------------------------
  const handleDeleteSubtask = async (taskId, subtaskId) => {
    try {
      const res = await fetch(
        `http://192.168.50.241:4000/tasks/${taskId}/subtasks/${subtaskId}`,
        {
          method: "DELETE",
        }
      );
      const updatedTask = await res.json();
      dispatch({ type: "EDIT_TASK", payload: updatedTask });
    } catch (error) {
      console.error("Erreur lors de la suppression de sous-tâche :", error);
    }
  };

  // ---------------------------------------------
  // 7. handleArchiveTask -> ex. "Terminer" la tâche (PUT /tasks/:id ?)
  // ---------------------------------------------
  const handleArchiveTask = async (taskId) => {
    try {
      // On part du principe qu'on fait un PUT pour mettre "archivedAt" côté back
      const res = await fetch(`http://192.168.50.241:4000/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archivedAt: new Date().toISOString() }),
      });
      const updatedTask = await res.json();

      // Côté front, on lance l'action "ARCHIVE_TASK"
      dispatch({
        type: "ARCHIVE_TASK",
        payload: { taskId, archivedAt: updatedTask.archivedAt },
      });

      setFeedbackMessage("Tâche terminée avec succès !");
      setTimeout(() => setFeedbackMessage(""), 3000);
    } catch (error) {
      console.error("Erreur lors de l'archivage de la tâche :", error);
    }
  };

  // ---------------------------------------------
  // 8. handleUpdateTaskStatus -> ex. PUT /tasks/:id (status)
  //    (si tu gères "open"/"closed" séparément de l'archivage)
  // ---------------------------------------------
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    const completedAt = newStatus === "closed" ? new Date().toISOString() : null;
    console.log(
      `handleUpdateTaskStatus - Tâche : ${taskId}, Nouveau statut : ${newStatus}, completedAt : ${completedAt}`
    );

    try {
      // On envoie la modif au back
      const res = await fetch(`http://192.168.50.241:4000/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, completedAt }),
      });
      const updatedTask = await res.json();

      // On met à jour le state local
      dispatch({
        type: "UPDATE_TASK_STATUS",
        payload: { taskId, newStatus, completedAt },
      });

      if (newStatus === "closed") {
        setFeedbackMessage("Tâche terminée avec succès !");
        setTimeout(() => setFeedbackMessage(""), 3000);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut :", error);
      setFeedbackMessage("Erreur lors de la mise à jour du statut !");
    }
  };

  // 9. handleTaskComplete -> combine archivage + statut
  const handleTaskComplete = (taskId) => {
    handleUpdateTaskStatus(taskId, "closed"); // Marque comme terminée
    handleArchiveTask(taskId); // Déplace dans les archives
    setFeedbackMessage("Tâche terminée et archivée avec succès !");
    setTimeout(() => setFeedbackMessage(""), 3000);
  };

  // Filtrage local (inchangé)
  const [filter, setFilter] = useState({
    priority: "",
    date: "",
    status: "",
    sortOrder: "newest",
  });

  // Filtre local (inchangé)
  const filteredTasks = useMemo(() => {
    return state.tasks.filter((task) => {
      const matchesPriority =
        !filter.priority || task.priority === filter.priority;
      const matchesDate = !filter.date || task.date === filter.date;
      const matchesStatus = !filter.status || task.status === filter.status;
      return matchesPriority && matchesDate && matchesStatus;
    });
  }, [state.tasks, filter]);

  // ------------------------------------------------
  // 10. (Optionnel) on peut enlever la sauvegarde localStorage
  //    si on stocke désormais 100% des tâches côté serveur.
  // ------------------------------------------------
  // useEffect(() => {
  //   console.log("État des tâches mis à jour :", state.tasks);
  //   localStorage.setItem("tasks", JSON.stringify(state.tasks));
  //   localStorage.setItem("archivedTasks", JSON.stringify(state.archivedTasks));
  // }, [state]);

  return (
    <Router>
      <div className="app-container">
        <FloatingMenu />
        {feedbackMessage && (
          <div className="feedback-message">{feedbackMessage}</div>
        )}
        <div className="content-container">
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  tasks={filteredTasks}
                  archivedTasks={state.archivedTasks}
                  onAddTask={handleAddTask}
                  onEditTask={handleEditTask}
                  onArchiveTask={handleArchiveTask}
                  onAddSubtask={handleAddSubtask}
                  onDeleteTask={handleDeleteTask}
                  onDeleteSubtask={handleDeleteSubtask}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onTaskComplete={handleTaskComplete}
                  filter={filter}
                  setFilter={setFilter}
                />
              }
            />
            <Route
              path="/archives"
              element={
                <Archives
                  archivedTasks={state.archivedTasks}
                  handleDeleteTask={handleDeleteTask}
                />
              }
            />
            <Route path="*" element={<div>Page non trouvée</div>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
