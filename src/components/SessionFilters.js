import React, { useEffect, useState } from "react";
import "./TaskFilters.css"; // Réutiliser le même style que TaskFilters

const SessionFilters = ({ filter = {}, setFilter = () => {}, tasks = [] }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(() => {
    const saved = localStorage.getItem('sessionSelectedCategories');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    // Extraire les catégories uniques des tâches
    const uniqueCategories = [...new Set(tasks.flatMap(task => task.categories || []))];
    setCategories(uniqueCategories);
  }, [tasks]);

  // Gestion des changements de filtres avec mise à jour correcte de l'état
  const handleChange = (key, value) => {
    // Créer un nouvel objet avec la valeur mise à jour avant de le stocker
    const updatedFilter = { ...filter, [key]: value };
    setFilter(updatedFilter);
    localStorage.setItem('sessionFilters', JSON.stringify(updatedFilter));
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
      localStorage.setItem('sessionSelectedCategories', JSON.stringify(categories));
      handleChange("categories", categories);
    } else if (selected.includes("none")) {
      setSelectedCategories([]);
      localStorage.setItem('sessionSelectedCategories', JSON.stringify([]));
      handleChange("categories", []);
    } else {
      setSelectedCategories(selected);
      localStorage.setItem('sessionSelectedCategories', JSON.stringify(selected));
      handleChange("categories", selected);
    }
  };

  return (
    <div className="task-filters">
      <h3>Filtres de sessions</h3>
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
              value={filter.sortOrder || "newest"}
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

        {/* Filtre par type de session */}
        <div className="filter-group">
          <label>
            Type :
            <select
              value={filter.sessionType || ""}
              onChange={(e) => handleChange("sessionType", e.target.value)}
            >
              <option value="">Tous</option>
              <option value="task">Tâche principale</option>
              <option value="subtask">Sous-tâche</option>
            </select>
          </label>
        </div>

        {/* Filtre par durée */}
        <div className="filter-group">
          <label>
            Durée minimum (minutes) :
            <input
              type="number"
              value={filter.minDuration || ""}
              onChange={(e) => handleChange("minDuration", e.target.value)}
              min="0"
              step="5"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default SessionFilters;
