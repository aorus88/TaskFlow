import React from "react";
import "./TaskFilters_home.css"; // Centralisation des styles dans un fichier commun

const TaskFilters_home = ({ filter = {}, setFilter = () => {} }) => {
  // Gestion des changements de filtres
  const handleChange = (key, value) => {
    setFilter({ ...filter, [key]: value });
  };

  return (
    <div className="task-filters">
      <h3>Filtres</h3>
      <div className="filter-container">
        {/* Filtre de priorité */}
        <div className="filter-group">
          <label>
            Priorité :
            <select
              value={filter.priority || ""}
              onChange={(e) => handleChange("priority", e.target.value)}
            >
              <option value="">Toutes</option>
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
          </label>
        </div>

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

        {/* Filtre de recherche */}
        <div className="filter-group">
          <label>
            Recherche :
            <input
              type="text"
              value={filter.search || ""}
              onChange={(e) => handleChange("search", e.target.value)}
              placeholder="Rechercher une tâche..."
            />
          </label>
          </div>

        {/* Filtre de catégorie */}
        <div className="filter-group">
          <label>
            Catégorie :
            <select
              value={filter.category || ""}
              onChange={(e) => handleChange("category", e.target.value)}
            >
              <option value="">Toutes</option>
              <option value="work">Travail</option>
              <option value="personal">Personnel</option>
              <option value="other">Autre</option>
            </select>
          </label>
          </div>



      </div>
    </div>
  );
};

export default TaskFilters_home;