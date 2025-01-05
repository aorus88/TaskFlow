import React, { useState } from "react";
import "./TaskForm.css"; // Centralisation des styles

const TaskForm = ({ onAddTask }) => {
  const [formData, setFormData] = useState({
    name: "",
    date: new Date().toISOString().split("T")[0],
    time: "20:00",
    priority: "medium",
  });

  // Fonction pour gérer les changements dans le formulaire
  const handleChange = (key, value) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };

  // Gestion de l'ajout de tâche
  const handleAddTask = () => {
    if (!formData.name.trim()) {
      alert("Le nom de la tâche est requis.");
      return;
    }

    if (typeof onAddTask === "function") {
      onAddTask({
        ...formData,
        id: Date.now(),
        subtasks: [], // Nouveau tableau par défaut
        timeSpent: 1, // Initialisation à 1
        status: "closed", // Statut par défaut
        addedAt: new Date().toISOString(), // Date et heure d'ajout
      });

      setFormData({
        name: "",
        date: new Date().toISOString().split("T")[0],
        time: "20:00",
        priority: "low",
      });
    } else {
      console.error("onAddTask n'est pas défini ou n'est pas une fonction valide.");
    }
  };

  // Gestion de la touche Entrée
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Empêche le comportement par défaut du formulaire
      handleAddTask(); // Sauvegarde les modifications
    }
  };

  return (
    <div className="task-form">
      <form onKeyDown={handleKeyDown} className="task-form">
        <label>
          Tâche :
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </label>

        <label>
          Echéance :
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
          />
        </label>

        <label>
          Echéance (heure) :
          <input
            type="time"
            value={formData.time}
            onChange={(e) => handleChange("time", e.target.value)}
          />
        </label>

        <label>
          Priorité :
          <select
            value={formData.priority}
            onChange={(e) => handleChange("priority", e.target.value)}
          >
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Élevée</option>
          </select>
        </label>

        <button type="button" onClick={handleAddTask}>
          Ajouter une tâche
        </button>
      </form>
    </div>
  );
};

export default TaskForm;