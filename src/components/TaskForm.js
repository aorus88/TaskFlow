import React, { useState } from "react";
import "./TaskForm.css"; // Centralisation des styles
import { ca } from "date-fns/locale";

const TaskForm = ({ onAddTask }) => {
  const [formData, setFormData] = useState({
    name: "",
    date: new Date().toISOString().split("T")[0],
    time: "23:59",
    priority: "medium",
    categories: "personnal", // Ajout de la catégorie par défaut
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
        timeSpent: 0, // Initialisation à 0
        status: "closed", // Statut par défaut
        addedAt: new Date().toISOString(), // Date et heure d'ajout
        categories: formData.categories, // Ajout de la catégorie
      });

      setFormData({
        name: "",
        date: new Date().toISOString().split("T")[0],
        time: "23:59",
        priority: "low",
        categories: "personal", // Réinitialisation de la catégorie
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

        <label>
      Catégories :
      <select
        value={formData.categories}
        onChange={(e) => handleChange("categories", e.target.value)}
      >
        <option value="">Aucune</option>
        <option value="Travail">Travail</option>
        <option value="Personnel">Personnel</option>
        <option value="Santé">Santé</option>
        <option value="Finance">Finance</option>
        <option value="Éducation">Éducation</option>
        <option value="Divertissement">Divertissement</option>
        <option value="Maison">Maison</option>
        <option value="Achats">Achats</option>
        <option value="Autre">Autre</option>
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