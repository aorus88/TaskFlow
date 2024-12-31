import React, { useState } from "react";
import "./EditTaskModal.css"; // Fichier CSS pour le style de la modale

const EditTaskModal = ({ task, onClose, onSave }) => {
  const [name, setName] = useState(task.name);
  const [date, setDate] = useState(task.date);
  const [priority, setPriority] = useState(task.priority);
  const [categories, setCategories] = useState(
    Array.isArray(task.categories) ? task.categories.join(", ") : ""
  );
  const [totalTime, setTotalTime] = useState(task.totalTime || 0);
  const [currentSessionTime, setCurrentSessionTime] = useState(task.currentSessionTime || 0);

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
      categories: categories.split(",").map((cat) => cat.trim()), // Transforme les catégories en tableau
      totalTime: parseInt(totalTime, 10), // Convertit le temps total en entier
      currentSessionTime: parseInt(currentSessionTime, 10), // Convertit le temps de session en entier
    };

    // Appelle la fonction "onSave" pour transmettre les modifications au parent
    onSave(updatedTask);

    // Ferme la modale
    onClose();
  };

  // Gestion de la touche Entrée
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Empêche le comportement par défaut du formulaire
      handleUpdateTask(); // Sauvegarde les modifications
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
            Catégories (séparées par des virgules) :
            <input
              type="text"
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              placeholder="ex: Travail, Personnel"
            />
          </label>
          <label>
            Temps total (minutes) :
            <input
              type="number"
              value={totalTime}
              onChange={(e) => setTotalTime(e.target.value)}
              min="0"
            />
          </label>
          <label>
            Temps de session en cours (minutes) :
            <input
              type="number"
              value={currentSessionTime}
              onChange={(e) => setCurrentSessionTime(e.target.value)}
              min="0"
            />
          </label>
        </form>
        <div className="modal-buttons">
          <button onClick={handleUpdateTask}>Sauvegarder</button>
          <button onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;