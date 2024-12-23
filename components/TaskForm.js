import React, { useState } from "react";
import "./TaskForm.css"; // Fichier de styles spécifique au formulaire

const TaskForm = ({ onAddTask }) => {
  const [taskInput, setTaskInput] = useState("");
  const [taskDate, setTaskDate] = useState(() => new Date().toISOString().split("T")[0]); // Date par défaut : aujourd'hui
  const [taskTime, setTaskTime] = useState("12:00");
  const [taskPriority, setTaskPriority] = useState("medium");

  // Fonction pour ajouter une tâche
  const handleAddTask = () => {
    if (!taskInput.trim()) {
      alert("Le nom de la tâche est requis.");
      return;
    }

    // Appel de la fonction passée en props pour ajouter la tâche
    onAddTask({
      id: Date.now(),
      name: taskInput,
      date: taskDate,
      time: taskTime,
      priority: taskPriority,
      subtasks: [],
      timeSpent: 0,
    });

    // Réinitialisation des champs
    setTaskInput("");
  };

  // Gestion de la touche Entrée
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Empêche le comportement par défaut du formulaire
      handleAddTask(); // Ajoute la tâche
    }
  };

  return (
    <div className="task-form">
      <input
        type="text"
        value={taskInput}
        onChange={(e) => setTaskInput(e.target.value)}
        onKeyDown={handleKeyDown} // Détecte la touche Entrée
        placeholder="Nom de la tâche"
      />
      <input
        type="date"
        value={taskDate}
        onChange={(e) => setTaskDate(e.target.value)}
      />
      <input
        type="time"
        value={taskTime}
        onChange={(e) => setTaskTime(e.target.value)}
      />
      <select
        value={taskPriority}
        onChange={(e) => setTaskPriority(e.target.value)}
      >
        <option value="low">Basse</option>
        <option value="medium">Moyenne</option>
        <option value="high">Haute</option>
      </select>
      <button onClick={handleAddTask}>Ajouter</button>
    </div>
  );
};

export default TaskForm;
