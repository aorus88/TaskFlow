import React from "react";
import "./Tasks.css"; // Centralisation des styles dans un fichier commun

const TaskFilters = ({ filter = {}, setFilter = () => {} }) => {
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

  

        {/* Application logique pour le statut */}
        {filter.status === "open" && (
          // Filtre les tâches avec le statut 'open'
          <p>Affiche uniquement les tâches non archivées.</p>
        )}
        {filter.status === "closed" && (
          // Filtre les tâches avec le statut 'closed'
          <p>Affiche uniquement les tâches archivées.</p>
        )}

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
      </div>
    </div>
  );
};

export default TaskFilters;