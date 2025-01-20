import React, { useEffect, useState, useRef } from "react";
import "./TaskFilters_home.css";

const TaskFilters_home = ({ filter = {}, setFilter = () => {}, taskCategories = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Charger les filtres sauvegardés au démarrage
  useEffect(() => {
    const savedFilters = localStorage.getItem('taskFilters');
    if (savedFilters) {
      setFilter(JSON.parse(savedFilters));
    }
  }, []);
  
  // État local pour gérer les catégories sélectionnées
  const [selectedCategories, setSelectedCategories] = useState(() => {
    const saved = localStorage.getItem('selectedCategories');
    return saved ? JSON.parse(saved) : [];
  });

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
      setSelectedCategories(taskCategories);
      localStorage.setItem('selectedCategories', JSON.stringify(taskCategories));
      handleChange("categories", taskCategories);
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

  // Gestion des changements de filtres avec sauvegarde
  const handleChange = (key, value) => {
    const newFilters = { ...filter, [key]: value };
    setFilter(newFilters);
    localStorage.setItem('taskFilters', JSON.stringify(newFilters));
  };

  // Gestionnaire de clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ajout de la fonction pour les options spéciales
  const handleSpecialCategoryChange = (type) => {
    const newSelection = type === 'all' ? [...taskCategories] : [];
    setSelectedCategories(newSelection);
    localStorage.setItem('selectedCategories', JSON.stringify(newSelection));
    handleChange("categories", newSelection);
  };

  return (
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
          Catégories :
          <select
            multiple
            value={selectedCategories}
            onChange={handleCategoryChange}
            className="dropdown-select"
          >
            <option value="all">Toutes</option>
            <option value="none">Aucune</option>
            {taskCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
      ))}
    </select>
  </label>
</div>
</div>
          );
        };

        export default TaskFilters_home;

