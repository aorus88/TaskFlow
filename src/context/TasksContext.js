import React, { createContext, useState, useEffect, useCallback } from 'react';

export const TasksContext = createContext();

export const TasksProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour récupérer toutes les tâches
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://192.168.50.241:4000/all-tasks');
      if (!response.ok) throw new Error('Erreur réseau');
      
      const data = await response.json();
      if (Array.isArray(data)) {
        setTasks(data);
        
        // Traiter les sessions de toutes les tâches
        const allSessions = data.flatMap(task =>
          task.sessions?.map(session => {
            const end = new Date(session.date);
            const start = new Date(new Date(session.date).getTime() - session.duration * 60000);
            
            let subtaskName = null;
            if (session.type === 'subtask' && session.targetId) {
              const subtask = task.subtasks?.find(st => st._id === session.targetId);
              subtaskName = subtask?.name;
            }
            
            return {
              ...session,
              taskId: task._id,
              taskName: task.name,
              subtaskName,
              totalTime: task.totalTime,
              categories: task.categories,
              start: isNaN(start) ? null : start,
              end: isNaN(end) ? null : end,
            };
          }) || []
        );
        
        setSessions(allSessions);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des tâches:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les tâches au montage du contexte
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  
  // Helper functions pour filtrer les tâches
  const getOpenTasks = () => tasks.filter(task => task.status === "open");
  const getClosedTasks = () => tasks.filter(task => task.status === "closed");

  // Valeur à fournir via le contexte
  const contextValue = {
    tasks,
    sessions,
    loading,
    error,
    fetchTasks, // Pour rafraîchir les tâches après modifications
    getOpenTasks,
    getClosedTasks
  };

  return (
    <TasksContext.Provider value={contextValue}>
      {children}
    </TasksContext.Provider>
  );
};