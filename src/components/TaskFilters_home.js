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
  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => {
      const newSelection = prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category];
      
      localStorage.setItem('selectedCategories', JSON.stringify(newSelection));
      handleChange("categories", newSelection);
      return newSelection;
    });
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
          <label>Catégories</label>
          <div className="dropdown-checklist" ref={dropdownRef}>
            <div 
              className="dropdown-header"
              onClick={() => setIsOpen(!isOpen)}
            >
              Sélectionner ({selectedCategories.length})
              <span className={`arrow ${isOpen ? 'up' : 'down'}`}>▼</span>
            </div>
            {isOpen && (
              <div className="dropdown-list">
                <div className="special-options">
                  <label className="checkbox-item special">
                    <span onClick={() => handleSpecialCategoryChange('all')}>
                      Toutes
                    </span>
                  </label>
                  <label className="checkbox-item special">
                    <span onClick={() => handleSpecialCategoryChange('none')}>
                      Aucunes
                    </span>
                  </label>
                </div>
                <div className="separator"></div>
                {taskCategories.map((category) => (
                  <label key={category} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default TaskFilters_home;