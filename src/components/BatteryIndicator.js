import React from 'react';
import './BatteryIndicator.css';

const BatteryIndicator = ({ level, maxLevel = 5, showPercentage = true, size = 'medium' }) => {
  // Calculer le pourcentage de remplissage
  const percentage = Math.min(100, Math.round((level / maxLevel) * 100));
  
  // Déterminer la couleur en fonction du niveau de remplissage
  const getColor = () => {
    if (percentage <= 20) return '#ff4d4d'; // Rouge
    if (percentage <= 60) return '#ffa64d'; // Orange
    return '#4CAF50';                       // Vert
  };
  
  // Classes CSS dynamiques basées sur la taille
  const containerClass = `battery-container battery-${size}`;
  
  return (
    <div className="battery-indicator">
      <div className={containerClass}>
        <div className="battery-level" 
             style={{ 
               width: `${percentage}%`, 
               backgroundColor: getColor() 
             }} 
        />
        <div className="battery-tip" />
      </div>
      {showPercentage && (
        <div className="battery-text">
          {level}/{maxLevel} ({percentage}%)
        </div>
      )}
    </div>
  );
};

export default BatteryIndicator;
