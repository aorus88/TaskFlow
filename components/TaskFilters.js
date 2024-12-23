import React from "react";
import "./TaskFilters.css"; // Fichier CSS pour les styles spécifiques

const TaskFilters = ({ filter, setFilter }) => {
  const handlePriorityChange = (e) => {
    setFilter({ ...filter, priority: e.target.value });
  };

  const handleDateChange = (e) => {
    setFilter({ ...filter, date: e.target.value });
  };

  const handleStatusChange = (e) => {
    setFilter({ ...filter, status: e.target.value });
  };

  return (
    <div className="task-filters">
      <h3>Filtres</h3>
      <div className="filter-container">
        <div className="filter-group">
          <label>
            Priorité :
            <select value={filter.priority} onChange={handlePriorityChange}>
              <option value="">Toutes</option>
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
          </label>
        </div>

        <div className="filter-group">
          <label>
            Date :
            <input
              type="date"
              value={filter.date}
              onChange={handleDateChange}
            />
          </label>
        </div>

        <div className="filter-group">
          <label>
            Statut :
            <select value={filter.status} onChange={handleStatusChange}>
              <option value="">Tous</option>
              <option value="active">Actives</option>
              <option value="archived">Archivées</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;
