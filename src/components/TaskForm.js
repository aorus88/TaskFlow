import React, { useState } from "react";
import "./TaskForm.css"; // Centralisation des styles

const TaskForm = ({ onAddTask, taskCategories }) => {
  const [formData, setFormData] = useState({
    name: "",
    date: new Date().toISOString().split("T")[0],
    time: "23:59",
    priority: "medium",
    categories: "Personnel 🐈", // Ajout de la catégorie par défaut
    subtasks: [], // Ajout du tableau de sous-tâches
    taskType: "task" // Ajout du type de tâche (task ou habit)
  });

  const [errors, setErrors] = useState({});

  // Fonction pour gérer les changements dans le formulaire
  const handleChange = (key, value) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };

  // Validation des données du formulaire
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Le nom de la tâche est requis.";
    }
    if (!formData.date) {
      newErrors.date = "La date d'échéance est requise.";
    }
    if (!formData.time) {
      newErrors.time = "L'heure d'échéance est requise.";
    }
    if (!formData.priority) {
      newErrors.priority = "La priorité est requise.";
    }
    if (!formData.categories) {
      newErrors.categories = "La catégorie est requise.";
    }
    if (!formData.taskType) {
      newErrors.taskType = "Le type de tâche est requis.";
    }
    return newErrors;
  };

  // Gestion de l'ajout de tâche
  const handleAddTask = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onAddTask({
        ...formData,
        id: Date.now(),
        subtasks: formData.subtasks, // Utiliser les sous-tâches existantes au lieu d'un tableau vide
        timeSpent: 0,
        status: "open",
        addedAt: new Date().toISOString(),
      });
      setFormData({
        name: "",
        date: new Date().toISOString().split("T")[0],
        time: "23:59",
        priority: "medium",
        categories: "Personnel 🐈",
        subtasks: [], // Réinitialiser les sous-tâches
        taskType: "task" // Réinitialiser le type de tâche
      });
      setErrors({});
    } catch (error) {
      console.error("Erreur lors de l'ajout de la tâche:", error);
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
        <div className="form-group-task">

        <div className="form-model">
    </div>

          <label>
            Tâche :
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </label>
        </div>

        <div className="form-group">
          <label>
            Type de tâche :
            <select
              value={formData.taskType}
              onChange={(e) => handleChange("taskType", e.target.value)}
            >
              <option value="task">Tâche ordinaire</option>
              <option value="habit">Habitude quotidienne</option>
            </select>
            {errors.taskType && <span className="error-message">{errors.taskType}</span>}
          </label>
          {formData.taskType === "habit" && (
            <p className="info-message">
              Les habitudes seront automatiquement renouvelées chaque jour.
            </p>
          )}
        </div>

        <div className="form-group">
          <label>
            Echéance :
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
            />
            {errors.date && <span className="error-message">{errors.date}</span>}
          </label>
        </div>

        <div className="form-group">
          <label>
            Echéance (heure) :
            <input
              type="time"
              value={formData.time}
              onChange={(e) => handleChange("time", e.target.value)}
            />
            {errors.time && <span className="error-message">{errors.time}</span>}
          </label>
        </div>

        <div className="form-group">
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
            {errors.priority && <span className="error-message">{errors.priority}</span>}
          </label>
        </div>

        <div className="form-group">
          <label>
            Catégories :
            <select
              value={formData.categories}
              onChange={(e) => handleChange("categories", e.target.value)}
            >
              <option value="Personnel 🐈">Personnel 🐈</option>
              {taskCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.categories && <span className="error-message">{errors.categories}</span>}
          </label>
        </div>

        <button type="button" onClick={handleAddTask}>
          {formData.taskType === "habit" ? "Ajouter une habitude" : "Ajouter une tâche"}
        </button>
        
      </form>
    </div>
  );
};

export default TaskForm;