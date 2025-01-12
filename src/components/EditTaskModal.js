import React, { useState, useEffect } from "react";
import "./EditTaskModal.css";

const EditTaskModal = ({ task, onClose, onSave, taskCategories = [] }) => {
  const [name, setName] = useState(task.name);
  const [date, setDate] = useState(task.date);
  const [priority, setPriority] = useState(task.priority);
  const [categories, setCategories] = useState(task.categories || "");
  const [totalTime, setTotalTime] = useState(task.totalTime || 0);
  const [currentSessionTime, setCurrentSessionTime] = useState(task.currentSessionTime || 0);
  const [newSubtask, setNewSubtask] = useState("");

  // Ajout du useEffect pour initialiser les catégories
  useEffect(() => {
    // Mise à jour des states quand la tâche change
    setName(task.name);
    setDate(task.date);
    setPriority(task.priority);
    setCategories(task.categories);
    setTotalTime(task.totalTime || 0);
    setCurrentSessionTime(task.currentSessionTime || 0);
  }, [task]);

  const handleUpdateTask = () => {
    if (!name.trim()) {
      alert("Le nom de la tâche est requis.");
      return;
    }

    const updatedTask = {
      ...task,
      name,
      date,
      priority,
      categories: categories, // S'assurer que c'est une valeur scalaire
      totalTime: parseInt(totalTime, 10),
      currentSessionTime: parseInt(currentSessionTime, 10),
    };

    console.log('Catégories mises à jour:', categories); // Debug
    onSave(updatedTask);
    onClose();
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      const updatedTask = {
        ...task,
        subtasks: [
          ...task.subtasks,
          { id: Date.now(), name: newSubtask, archived: "open" },
        ],
      };
      onSave(updatedTask);
      setNewSubtask("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (newSubtask.trim()) {
        handleAddSubtask();
      } else {
        handleUpdateTask();
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Modifier la tâche</h3>
        <form onKeyDown={handleKeyDown} className="modal-form">
          <label>
            Nom de la tâche :
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom de la tâche"
            />
          </label>
          <label>
            Date d'échéance :
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label>
            Priorité :
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
          </label>


          <label>
          Catégories :
            <select
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
            >
              <option value="">Aucune</option>
              {taskCategories && taskCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>


          <label>
            Total sessions (minutes) :
            <div className="readonly-value">{totalTime}</div>
          </label>
          <label>
            Dernière session (minutes) :
            <div className="readonly-value">{currentSessionTime}</div>
          </label>
        </form>
        <div className="modal-buttons">
          <button onClick={handleUpdateTask}>Sauvegarder</button>
          <button onClick={onClose}>Annuler</button>
        </div>
        <div className="modal-subtasks">
          <form onKeyDown={handleKeyDown} className="modal-form">
            <input
              type="text"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              placeholder="Nom de la sous-tâche"
            />
            <button type="button" onClick={handleAddSubtask}>
              Ajouter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;