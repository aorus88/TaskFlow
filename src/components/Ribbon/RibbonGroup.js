import React from 'react';

const RibbonGroup = ({ title, children }) => {
  return (
    <div className="ribbon-group">
      <div className="ribbon-group-content">
        {children}
      </div>
      <div className="ribbon-group-title">{title}</div>
    </div>
  );
};

export default RibbonGroup;
