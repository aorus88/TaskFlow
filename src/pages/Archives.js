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
  // ----- DRAG & DROP -----
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

        {/* Bouton de suppression de la TÂCHE */}
        <button
          className="delete-button"
          onClick={() => onDeleteTask(task._id)}
        >
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
        <span>
          {Math.floor((task.totalTime || 0) / 60)} min passées
        </span>
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

                {/* Bouton de suppression de la SOUS-TÂCHE */}
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
}) => {
  // ----- ÉTATS LOCAUX -----
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState({});

  // ----- CONTEXTE -----
  const { selectedTaskId, setSelectedTaskId } = useContext(SelectedTaskContext);

  // ----- EFFET (FETCH TÂCHES ARCHIVÉES) -----
  // Question : Est-ce intentionnel de l'appeler à CHAQUE rendu ?
  // Suggestion : Ne l'appeler qu'au montage (dépendances vides)
  useEffect(() => {
    if (onFetchArchivedTasks) {
      onFetchArchivedTasks(true);
    }
  }, []); 
  // ^ Ici on a mis "[]" pour éviter la boucle infinie
  //   Si vous devez la rappeler sous d'autres conditions,
  //   mettre ces conditions en dépendances.

  // ----- MISE À JOUR DES TÂCHES LOCALES QUAND archivedTasks CHANGE -----
  useEffect(() => {
    setTasks(archivedTasks);
  }, [archivedTasks]);

  // Debug
  console.log("Archives.js - Tâches archivées reçues :", archivedTasks);
  console.log(
    "Archives.js - Sous-tâches archivées avec tâches parentes ouvertes :",
    archivedSubtasksWithOpenParent
  );

  // ----- GESTION DU DRAG & DROP -----
  const moveTask = (fromIndex, toIndex) => {
    const updatedTasks = [...tasks];
    const [movedTask] = updatedTasks.splice(fromIndex, 1);
    updatedTasks.splice(toIndex, 0, movedTask);
    setTasks(updatedTasks);
  };

  // ----- TRI DES TÂCHES (par date archivage) -----
  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = new Date(a.archivedAt);
    const dateB = new Date(b.archivedAt);
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  // ----- FILTRES -----
  // Remarque : si vos tâches n'ont pas "task.date" mais "task.archivedAt",
  // il faut adapter.
  const filteredTasks = sortedTasks.filter((task) => {
    // Par date
    if (
      filter.date &&
      new Date(task.archivedAt).toLocaleDateString() !==
        new Date(filter.date).toLocaleDateString()
    ) {
      return false;
    }

    // Par ID
    if (filter.taskId && task._id !== filter.taskId) {
      return false;
    }

    // Par catégories
    if (
      filter.categories &&
      filter.categories.length > 0 &&
      !filter.categories.some((category) => task.categories.includes(category))
    ) {
      return false;
    }

    // Par terme de recherche (nom de la tâche)
    if (searchTerm.trim() !== "") {
      if (!task.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  return (
    <DndProvider backend={HTML5Backend}>
      {/* Minuteur Global */}
      <GlobalPomodoroTimer
        tasks={tasks}
        fetchTasks={onFetchArchivedTasks}
        setSelectedTaskId={setSelectedTaskId}
        selectedTaskId={selectedTaskId}
        showFeedback={showFeedback}
      />

      {/* Filtres (catégorie, date, etc.) */}
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
          {/* Eventuellement un bouton pour changer l'ordre */}
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
            <div className="archived-ttasks-empty">
              Aucune tâche archivée.
            </div>
          )}
        </div>

        {/* Sous-tâches archivées dont la tâche parente est encore "open" */}
        <div className="archived-subtasks-section">
          <h2 className="archived-subtasks-title">
            Sous-tâches Archivées (Tâches Parentes Ouvertes)
          </h2>
          <ul className="archived-subtasks-list">
            {archivedSubtasksWithOpenParent.length > 0 ? (
              archivedSubtasksWithOpenParent.map((subtask) => (
                <li key={subtask._id} className="archived-subtask-item">
                  <div className="subtask-header">
                    <strong>Sous-tâche :</strong> {subtask.name}
                    <div className="subtask-details">
                      <span className="subtask-parent-task">
                        Tâche parente : {subtask.parentTaskName}
                      </span>
                      <span className="subtask-archived-date">
                        Archivé le : {formatDate(subtask.archivedAt)}
                      </span>
                    </div>
                    <button
                      className="delete-button"
                      onClick={() =>
                        onDeleteSubtask(subtask.parentTaskId, subtask._id)
                      }
                    >
                      Supprimer
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <p>Aucune sous-tâche archivée avec tâche parente ouverte.</p>
            )}
          </ul>
        </div>
      </div>
    </DndProvider>
  );
};

export default Archives;
