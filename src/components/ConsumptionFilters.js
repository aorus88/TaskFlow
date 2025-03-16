import React, { useEffect, useState } from "react";
import "./TaskFilters.css"; // Réutiliser le même style que TaskFilters

const ConsumptionFilters = ({ filter = {}, setFilter = () => {}, moodOptions = [] }) => {
  // Gestion des changements de filtres avec mise à jour correcte de l'état
  const handleChange = (key, value) => {
    // Créer un nouvel objet avec la valeur mise à jour avant de le stocker
    const updatedFilter = { ...filter, [key]: value };
    setFilter(updatedFilter);
    localStorage.setItem('consumptionFilters', JSON.stringify(updatedFilter));
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
              value={filter.sortOrder || "desc"}
              onChange={(e) => handleChange("sortOrder", e.target.value)}
            >
              <option value="desc">Du plus récent</option>
              <option value="asc">Du plus ancien</option>
            </select>
          </label>
        </div>

        {/* Filtre d'humeur */}
        <div className="filter-group">
          <label>
            Humeur :
            <select
              value={filter.mood || ""}
              onChange={(e) => handleChange("mood", e.target.value)}
            >
              <option value="">Toutes</option>
              {Object.entries(moodOptions).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Filtre de consommation */}
        <div className="filter-group">
          <label>
            Consommation :
            <select
              value={filter.consumption || ""}
              onChange={(e) => handleChange("consumption", e.target.value)}
            >
              <option value="">Tous</option>
              <option value="yes">Oui</option>
              <option value="no">Non</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ConsumptionFilters;
