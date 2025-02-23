import React, { useState, useEffect, useContext } from "react";
import GlobalPomodoroTimer from "../components/GlobalPomodoroTimer";
import { SelectedTaskContext } from "../context/SelectedTaskContext";
import "./Archives.css";

// Fonction de formatage de date (peut rester en dehors du composant)
const formatDate = (date) => {
  if (!date) return "Date inconnue";
  const parsedDate = new Date(date);
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
};

const Task = ({ task, index, onDeleteTask, onDeleteSubtask, onOpenTask }) => {
  return (
    <div className="archived-task-item">
      <div className="task-header">
        <strong>Statut :</strong>{" "}
        {task.archived === "closed" ? "🔴 Closed" : "🟢 Open"}

        <div className="task-details">
          <span className="task-archived-date">
            Archivé le : {formatDate(task.archivedAt)}
          </span>
        </div>

        <span className="task-name">
          <strong>{task.name}</strong>
        </span>

        {/* Bouton de suppression de la tâche */}
        <button className="delete-button" onClick={() => onDeleteTask(task._id)}>
          Supprimer
        </button>
        {/* Bouton pour rouvrir la tâche */}
        <button className="open-button" onClick={() => onOpenTask(task._id)}>
          Rouvrir
        </button>
      </div>

      <div className="task-priority">
        <span>
          {task.priority === "low" && "🟢 Basse"}
          {task.priority === "medium" && "🟠 Moyenne"}
          {task.priority === "high" && "🔴 Haute"}
        </span>
      </div>

      <div className="task-time-spent">
        <span>{Math.floor((task.totalTime || 0) / 60)} min passées</span>
        <hr className="task-separator" />
      </div>

      {/* Liste des sous-tâches archivées */}
      <ul className="archived-subtasks-list">
        {task.subtasks
          .filter((subtask) => subtask.archived === "closed")
          .sort((a, b) => new Date(a.archivedAt) - new Date(b.archivedAt))
          .map((subtask) => (
            <li key={subtask._id} className="archived-subtask-item">
              <div className="subtask-header">
                <strong>Sous-tâche :</strong> {subtask.name}
                <div className="subtask-details">
                  <span className="subtask-archived-date">
                    Archivé le : {formatDate(subtask.archivedAt)}
                  </span>
                </div>
                {/* Bouton de suppression de la sous-tâche */}
                <button
                  className="delete-button"
                  onClick={() => onDeleteSubtask(task._id, subtask._id)}
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

const Archives = ({
  archivedTasks,
  archivedSubtasksWithOpenParent = [],
  onDeleteTask,
  onDeleteSubtask,
  onFetchArchivedTasks,
  isDarkMode,
  toggleDarkMode,
  onUpdateTask, // Nouvelle prop pour mettre à jour la tâche
}) => {
  // États locaux
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState({});

  // Contexte sélection de tâche
  const { selectedTaskId, setSelectedTaskId } = useContext(SelectedTaskContext);

  // Appeler onFetchArchivedTasks une seule fois lors du montage
  useEffect(() => {
    if (onFetchArchivedTasks) {
      onFetchArchivedTasks(true);
    }
  }, []);

  // Mise à jour des tâches locales lorsque archivedTasks change
  useEffect(() => {
    setTasks(archivedTasks);
  }, [archivedTasks]);

  // Gestion de l'heure actuelle pour l'affichage de l'horloge
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fonction pour formater l'heure
  const formatClock = (time) => {
    return time.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Debug
  console.log("Archives.js - Tâches archivées reçues :", archivedTasks);
  console.log(
    "Archives.js - Sous-tâches archivées avec tâches parentes ouvertes :",
    archivedSubtasksWithOpenParent
  );

  // Tri des tâches par date d'archivage
  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = new Date(a.archivedAt);
    const dateB = new Date(b.archivedAt);
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  // Application des filtres (date, ID, catégories, recherche)
  const filteredTasks = sortedTasks.filter((task) => {
    if (
      filter.date &&
      new Date(task.archivedAt).toLocaleDateString() !==
        new Date(filter.date).toLocaleDateString()
    ) {
      return false;
    }
    if (filter.taskId && task._id !== filter.taskId) {
      return false;
    }
    if (
      filter.categories &&
      filter.categories.length > 0 &&
      !filter.categories.some((category) => task.categories.includes(category))
    ) {
      return false;
    }
    if (searchTerm.trim() !== "") {
      if (!task.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  // Fonction pour rouvrir une tâche
  const onOpenTask = async (taskId) => {
    try {
      // Appeler la fonction pour mettre à jour la tâche dans la base de données
      await onUpdateTask(taskId, { archived: "open", archivedAt: null });

      // Mettre à jour l'état local
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, archived: "open", archivedAt: null } : task
        )
      );
    } catch (error) {
      console.error("Erreur lors de la réouverture de la tâche :", error);
    }
  };

  return (
    <div className="Archives">
      <div className="statistics-container">
      
      

        <div className="archives-page">
          <h1>✅ Tâches terminées</h1>

          <div className="archived-tasks-header">
            <input
              type="text"
              placeholder="Rechercher une tâche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() =>
                setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
              }
            >
              Tri {sortOrder === "desc" ? "↑" : "↓"}
            </button>
          </div>

          <div className="archived-tasks-grid">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task, index) => (
                <Task
                  key={task._id}
                  index={index}
                  task={task}
                  onDeleteTask={onDeleteTask}
                  onDeleteSubtask={onDeleteSubtask}
                  onOpenTask={onOpenTask} // Passer la fonction onOpenTask
                />
              ))
            ) : (
              <div className="archived-tasks-empty">Aucune tâche archivée.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Archives;