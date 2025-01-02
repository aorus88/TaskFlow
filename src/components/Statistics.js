import React from "react";
import "./Statistics.css"; // Importer le fichier CSS

const Statistics = ({ tasks, archivedTasks }) => {
  console.log("Statistics.js - Tâches reçues :", tasks);
  console.log("Statistics.js - Tâches archivées :", archivedTasks);
  
  const allTasks = [...tasks, ...archivedTasks]; // Combine tasks et archivedTasks


  // Tâches ouvertes (statut différent de "closed")
  const openTasks = tasks.filter((task) => task.status !== "closed").length;

  // Calcul des priorités
  const lowPriorityTasks = tasks.filter((task) => task.priority === "low").length;
  const mediumPriorityTasks = tasks.filter((task) => task.priority === "medium").length;
  const highPriorityTasks = tasks.filter((task) => task.priority === "high").length;

  // Calcul des tâches terminées aujourd'hui
  const completedToday = tasks.filter((task) => {
    const taskDate = new Date(task.archivedAt);
    const today = new Date();
    return taskDate.toDateString() === today.toDateString();
  }
  ).length;
    


  return (
    <div>
      <h3>Statistiques des Tâches</h3>
      <p>Tâches ouvertes : {openTasks}</p>
      <p>Tâches terminées aujourd'hui : {completedToday}</p>
      <p>Tâches à faible priorité : {lowPriorityTasks}</p>
      <p>Tâches à priorité moyenne : {mediumPriorityTasks}</p>
      <p>Tâches à haute priorité : {highPriorityTasks}</p>
    </div>
  );
};

export default Statistics;