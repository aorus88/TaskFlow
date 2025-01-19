import React, { useState, useEffect, useContext } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import GlobalPomodoroTimer from "../components/GlobalPomodoroTimer"; // Importer le composant GlobalPomodoroTimer
import { SelectedTaskContext } from "../context/SelectedTaskContext"; // Importer le contexte
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

const Task = ({ task, index, moveTask, handleDeleteTask }) => {
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
        <strong>Statut :</strong> {task.archived === "closed" ? "🔴 Closed" : "🟢 Open"}
        <div className="task-details">
          <span className="task-archived-date">
            Archivé le : {formatDate(task.archivedAt)}
          </span>
        </div>
        <span className="task-name"><strong>{task.name}</strong></span>
        <button className="delete-button" onClick={() => handleDeleteTask(task._id)}>Supprimer</button>
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
      <ul className="archived-subtasks-list">
        {task.subtasks
          .filter(subtask => subtask.archived === "closed")
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
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

const Archives = ({ 
  archivedTasks, 
  archivedSubtasksWithOpenParent = [], // Default to an empty array if undefined
  handleDeleteTask,
  onFetchArchivedTasks,
  showFeedback
}) => {
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [tasks, setTasks] = useState(archivedTasks);
  const { selectedTaskId, setSelectedTaskId } = useContext(SelectedTaskContext); // Utiliser le contexte

  useEffect(() => {
    if (onFetchArchivedTasks) {
      onFetchArchivedTasks(true);
    }
  }, []);

  useEffect(() => {
    setTasks(archivedTasks);
  }, [archivedTasks]);

  console.log("Archives.js - Tâches archivées reçues :", archivedTasks);
  console.log("Archives.js - Sous-tâches archivées avec tâches parentes ouvertes :", archivedSubtasksWithOpenParent);

  if (!archivedTasks || archivedTasks.length === 0) {
    return <div className="archived-tasks-empty">Aucune tâche archivée.</div>;
  }

  const moveTask = (fromIndex, toIndex) => {
    const updatedTasks = [...tasks];
    const [movedTask] = updatedTasks.splice(fromIndex, 1);
    updatedTasks.splice(toIndex, 0, movedTask);
    setTasks(updatedTasks);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = new Date(a.archivedAt);
    const dateB = new Date(b.archivedAt);
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  const filteredTasks = sortedTasks.filter(task =>
    task.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <GlobalPomodoroTimer 
        tasks={tasks}
        fetchTasks={onFetchArchivedTasks}
        setSelectedTaskId={setSelectedTaskId}
        selectedTaskId={selectedTaskId}
        showFeedback={showFeedback}
      /> {/* Afficher un aperçu du minuteur */}

      <div className="archives-page">
        <h1>✅ Tâches terminées</h1>

        <div className="archived-tasks-header">
          <input
            type="text"
            placeholder="Rechercher une tâche..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="archived-tasks-grid">
          {filteredTasks.map((task, index) => (
            <Task
              key={task._id}
              index={index}
              task={task}
              moveTask={moveTask}
              handleDeleteTask={handleDeleteTask}
            />
          ))}
        </div>

        <div className="archived-subtasks-section">
          <h2 className="archived-subtasks-title">Sous-tâches Archivées (Tâches Parentes Ouvertes)</h2>
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