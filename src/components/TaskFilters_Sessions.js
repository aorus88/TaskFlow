// filepath: /src/components/TaskFilters_Sessions.js
import React, { useEffect, useState } from "react";
import "./Tasks.css"; // Centralisation des styles dans un fichier commun

const TaskFilters_Sessions = ({ filter = {}, setFilter = () => {}, tasks = [] }) => {
  const [categories, setCategories] = useState([]);
  const [taskIds, setTaskIds] = useState([]);

  useEffect(() => {
    // Extraire les catégories uniques des tâches
    const uniqueCategories = [...new Set(tasks.flatMap(task => task.categories))];
    setCategories(uniqueCategories);

    // Extraire les IDs de tâches uniques
    const uniqueTaskIds = [...new Set(tasks.map(task => task._id))];
    setTaskIds(uniqueTaskIds);
  }, [tasks]);

  // Gestion des changements de filtres
  const handleChange = (key, value) => {
    setFilter({ ...filter, [key]: value });
  };

  return (
    <div className="task-filters">
      <h3>Filtres</h3>
      <div className="filter-container">
        {/* Filtre de date */}
        <div className="filter-group">
          <label>
            Date :
            <input
              type="date"
              value={filter.date || ""}
              onChange={(e) => handleChange("date", e.target.value)}
            />
          </label>
        </div>

        {/* Filtre du plus récent ou plus ancien (ordre) */}
        <div className="filter-group">
          <label>
            Chronologie :
            <select
              value={filter.sortOrder || ""}
              onChange={(e) => handleChange("sortOrder", e.target.value)}
            >
              <option value="newest">Du plus récent</option>
              <option value="oldest">Du plus ancien</option>
            </select>
          </label>
        </div>

        {/* Filtre par tâche */}
        <div className="filter-group">
          <label>
            Tâche :
            <select
              value={filter.taskId || ""}
              onChange={(e) => handleChange("taskId", e.target.value)}
            >
              <option value="">Toutes</option>
              {tasks.map((task) => (
                <option key={task._id} value={task._id}>
                  {task.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Filtre par catégorie */}
        <div className="filter-group">
          <label>
            Catégorie :
            <select
              value={filter.category || ""}
              onChange={(e) => handleChange("category", e.target.value)}
            >
              <option value="">Toutes</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters_Sessions;