import React from 'react';

const RibbonButton = ({ icon, label, onClick, primary }) => {
  return (
    <button 
      className={`ribbon-button ${primary ? 'primary' : ''}`}
      onClick={onClick}
    >
      <i className={`fas fa-${icon}`}></i>
      <span className="ribbon-button-label">{label}</span>
    </button>
  );
};

export default RibbonButton;
