import React, { createContext, useState, useEffect } from 'react';

export const SelectedTaskContext = createContext();

export const SelectedTaskProvider = ({ children }) => {
  const [selectedTaskId, setSelectedTaskId] = useState(() => {
    const savedTaskId = localStorage.getItem('selectedTaskId');
    return savedTaskId ? JSON.parse(savedTaskId) : null;
  });

  useEffect(() => {
    localStorage.setItem('selectedTaskId', JSON.stringify(selectedTaskId));
  }, [selectedTaskId]);

  return (
    <SelectedTaskContext.Provider value={{ selectedTaskId, setSelectedTaskId }}>
      {children}
    </SelectedTaskContext.Provider>
  );
};