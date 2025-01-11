import React, { useState } from "react";
import "./EditTaskModal.css"; // Fichier CSS pour le style de la modale

const EditTaskModal = ({ task, onClose, onSave, taskCategories = [] }) => {
  const [name, setName] = useState(task.name);
  const [date, setDate] = useState(task.date);
  const [priority, setPriority] = useState(task.priority);
  const [categories, setCategories] = useState(task.categories || "");
  const [totalTime, setTotalTime] = useState(task.totalTime || 0);
  const [currentSessionTime, setCurrentSessionTime] = useState(task.currentSessionTime || 0);
  const [newSubtask, setNewSubtask] = useState("");
  const [showSessions, setShowSessions] = useState(false);

  // Fonction pour mettre à jour la tâche
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
      categories, // Utiliser les catégories sélectionnées
      totalTime: parseInt(totalTime, 10), // Convertit le temps total en entier
      currentSessionTime: parseInt(currentSessionTime, 10), // Convertit le temps de session en entier
    };

    // Appelle la fonction "onSave" pour transmettre les modifications au parent
    onSave(updatedTask);

    // Ferme la modale
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

  // Gestion de la touche Entrée
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Empêche le comportement par défaut du formulaire
      if (newSubtask.trim()) {
        handleAddSubtask(); // Ajoute la sous-tâche
      } else {
        handleUpdateTask(); // Sauvegarde les modifications
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
              value={categories || ""}
              onChange={(e) => setCategories(e.target.value)}
            >
              <option value="">Toutes</option>
              {taskCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label>
            Total sessions (minutes) :
            <div className="readonly-value">
              {totalTime}
            </div>
          </label>
          <label>
            Dernière session (minutes) :
            <div className="readonly-value">
              {currentSessionTime}
            </div>
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
            <button type="button" onClick={handleAddSubtask}>Ajouter</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;