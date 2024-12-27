// src/components/Statistics.js
import React from "react";

console.log("Liste des tâches reçues dans Statistics :", tasks);
console.log(
  "Tâches terminées aujourd'hui :",
  tasks.filter(
    (task) =>
      task.status === "closed" &&
      task.completedAt &&
      task.completedAt.startsWith(new Date().toISOString().split("T")[0])
  )
);


const Statistics = ({ tasks, archivedTasks }) => {
  console.log("Statistics.js - Tâches reçues :", tasks);
  console.log("Statistics.js - Tâches archivées :", archivedTasks);
  
  const allTasks = [...tasks, ...archivedTasks]; // Combine tasks et archivedTasks

  const totalTasks = allTasks.length;
  // Tâches terminées (statut "closed")
  const completedTasks = allTasks.filter((task) => task.status === "closed").length;

  // Tâches ouvertes (statut différent de "closed")
  const openTasks = tasks.filter((task) => task.status !== "closed").length;

  // Calcul des priorités
  const lowPriorityTasks = tasks.filter((task) => task.priority === "low").length;
  const mediumPriorityTasks = tasks.filter((task) => task.priority === "medium").length;
  const highPriorityTasks = tasks.filter((task) => task.priority === "high").length;

  // Calcul des tâches terminées aujourd'hui
  const today = new Date().toISOString().split("T")[0];
  console.log("Tâches reçues dans Statistics :", tasks);
  const completedToday = tasks.filter(
    (task) =>
      task.status === "closed" &&
      task.completedAt?.startsWith(today) // Vérifie completedAt pour les tâches actives
      || task.archivedAt?.startsWith(today) // Vérifie archivedAt pour les tâches archivées
  ).length;

  console.log("Statistics.js - Tâches terminées aujourd'hui :", completedToday);

  return (
    <div>
      <h2>Statistiques des Tâches</h2>
      <p>Total des tâches : {totalTasks}</p>
      <p>Tâches terminées : {completedTasks}</p>
      <p>Tâches terminées aujourd'hui : {completedToday}</p>
    </div>
  );
};

export default Statistics;
