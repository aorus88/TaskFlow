import React, { useEffect, useState } from "react";
import "./TaskFilters_Sessions.css"; // Centralisation des styles dans un fichier commun

const TaskFilters_Sessions = ({ filter = {}, setFilter = () => {}, tasks = [] }) => {
  const [categories, setCategories] = useState([]);
  const [taskIds, setTaskIds] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(() => {
    const saved = localStorage.getItem('selectedCategories');
    return saved ? JSON.parse(saved) : [];
  });

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
    localStorage.setItem('taskFilters', JSON.stringify({ ...filter, [key]: value }));
  };

  // Gestionnaire de changement de catégorie
  const handleCategoryChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }

    if (selected.includes("all")) {
      setSelectedCategories(categories);
      localStorage.setItem('selectedCategories', JSON.stringify(categories));
      handleChange("categories", categories);
    } else if (selected.includes("none")) {
      setSelectedCategories([]);
      localStorage.setItem('selectedCategories', JSON.stringify([]));
      handleChange("categories", []);
    } else {
      setSelectedCategories(selected);
      localStorage.setItem('selectedCategories', JSON.stringify(selected));
      handleChange("categories", selected);
    }
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


        {/* Filtre par catégorie */}
        <div className="filter-group">
          <label>
            Catégories :
            <select
              multiple
              value={selectedCategories}
              onChange={handleCategoryChange}
              className="dropdown-select"
            >
              <option value="all">Toutes</option>
              <option value="none">Aucune</option>
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