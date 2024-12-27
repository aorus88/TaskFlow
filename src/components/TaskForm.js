import React, { useState } from "react";
import "./Tasks.css"; // Centralisation des styles

const TaskForm = ({ onAddTask }) => {
  const [formData, setFormData] = useState({
    name: "",
    date: new Date().toISOString().split("T")[0],
    time: "20:00",
    priority: "low",
  });

  // Gestion des changements dans le formulaire
  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  // Gestion de l'ajout de tâche
  const handleAddTask = () => {
    if (!formData.name.trim()) {
      alert("Le nom de la tâche est requis.");
      return;
    }

    onAddTask({
      ...formData,
      id: Date.now(),
      subtasks: [], // Par défaut, chaque tâche commence avec une liste vide de sous-tâches
      timeSpent: 0,
      status: "open", // nouveau statut par défaut
      addedAt: new Date().toISOString(), // Date et heure d'ajout
    });

    // Réinitialisation des champs
    setFormData({
      name: "",
      date: new Date().toISOString().split("T")[0],
      time: "20:00",
      priority: "low",
    });
  };

  // Gestion de la touche Entrée
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Empêche le comportement par défaut du formulaire
      handleAddTask(); // Appelle la fonction d'ajout de tâche
    }
  };

  return (
    <form onKeyDown={handleKeyDown} className="task-form">
      <input
        type="text"
        value={formData.name}
        onChange={(e) => handleChange("name", e.target.value)}
        placeholder="Nom de la tâche"
      />
      <input
        type="date"
        value={formData.date}
        onChange={(e) => handleChange("date", e.target.value)}
      />
      <input
        type="time"
        value={formData.time}
        onChange={(e) => handleChange("time", e.target.value)}
      />
      <select
        value={formData.priority}
        onChange={(e) => handleChange("priority", e.target.value)}
      >
        <option value="low">Basse</option>
        <option value="medium">Moyenne</option>
        <option value="high">Haute</option>
      </select>
      <button type="button" onClick={handleAddTask}>
        Ajouter
      </button>
    </form>
  );
};

export default TaskForm;
