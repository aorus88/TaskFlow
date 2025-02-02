import React, { useState, useEffect, useContext } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import GlobalPomodoroTimer from "../components/GlobalPomodoroTimer";
import { SelectedTaskContext } from "../context/SelectedTaskContext";
import TaskFilters_Sessions from "../components/TaskFilters_Sessions";
import "./Archives.css";

const ItemType = {
  TASK: "task",
};

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

const Task = ({ task, index, moveTask, onDeleteTask, onDeleteSubtask }) => {
  // DRAG & DROP
  const [, ref] = useDrag({
    type: ItemType.TASK,
    item: { index },
  });

  const [, drop] = useDrop({
    accept: ItemType.TASK,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveTask(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div ref={(node) => ref(drop(node))} className="archived-task-item">
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
  showFeedback,
  isDarkMode,
  toggleDarkMode,
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

  // Gestion du drag & drop
  const moveTask = (fromIndex, toIndex) => {
    const updatedTasks = [...tasks];
    const [movedTask] = updatedTasks.splice(fromIndex, 1);
    updatedTasks.splice(toIndex, 0, movedTask);
    setTasks(updatedTasks);
  };

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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="Archives"></div>

      <div className="statistics-header">
        <h2>
          ⛩️ TaskFlow 1.3.6 💤 -- 🕒 {formatClock(currentTime)}
          <div className="dark-mode-toggle">
            <h3>Mode sombre</h3>
            <button onClick={toggleDarkMode} className="dark-mode-button">
              {isDarkMode ? "🌚" : "🌞"}
            </button>
            <div />
          </div>
        </h2>

        {/* Minuteur Global */}
        <GlobalPomodoroTimer
          tasks={tasks}
          fetchTasks={onFetchArchivedTasks}
          setSelectedTaskId={setSelectedTaskId}
          selectedTaskId={selectedTaskId}
          showFeedback={showFeedback}
        />

        {/* Filtres */}
        <TaskFilters_Sessions filter={filter} setFilter={setFilter} tasks={tasks} />

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
                  moveTask={moveTask}
                  onDeleteTask={onDeleteTask}
                  onDeleteSubtask={onDeleteSubtask}
                />
              ))
            ) : (
              <div className="archived-tasks-empty">
                Aucune tâche archivée.
              </div>
            )}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default Archives;
