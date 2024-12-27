import React, { useState } from "react";
import "./EditTaskModal.css"; // Fichier CSS pour le style de la modale

const EditTaskModal = ({ task, onClose, onSave }) => {
  const [name, setName] = useState(task.name);
  const [date, setDate] = useState(task.date);
  const [priority, setPriority] = useState(task.priority);

  const handleSave = () => {
    if (!name.trim()) {
      alert("Le nom de la tâche est requis.");
      return;
    }
    onSave({ ...task, name, date, priority }); // Passe la tâche modifiée à la fonction `onSave`
    onClose(); // Ferme la modale après la sauvegarde
  };

  // Gestion de la touche Entrée
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Empêche le comportement par défaut du formulaire
      handleSave(); // Sauvegarde les modifications
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
        </form>
        <div className="modal-buttons">
          <button onClick={handleSave}>Sauvegarder</button>
          <button onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;
