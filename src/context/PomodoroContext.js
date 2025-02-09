// PomodoroContext.js
import React, { createContext, useState, useEffect } from 'react';

export const PomodoroContext = createContext();

export const PomodoroProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchTasksAndSessions = async () => {
      try {
        // Appel à l'endpoint qui renvoie uniquement les tâches "open"
        const response = await fetch('http://192.168.50.241:4000/tasks?archived=false');
        const data = await response.json();
        if (Array.isArray(data)) {
          // Ici, les tâches sont déjà enrichies côté back (status "open" ou "closed")
          setTasks(data);

          // Rassembler toutes les sessions issues de chaque tâche
          const allSessions = data.flatMap(task =>
            (Array.isArray(task.sessions) ? task.sessions.map(session => {
              const end = new Date(session.date);
              const start = new Date(new Date(session.date).getTime() - session.duration * 60000);
              return {
                ...session,
                taskId: task._id,
                taskName: task.name,
                totalTime: task.totalTime,
                categories: task.categories,
                start: isNaN(start) ? null : start,
                end: isNaN(end) ? null : end,
              };
            }) : [])
          );
          setSessions(allSessions);
        } else {
          console.error('Les données reçues ne sont pas un tableau:', data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des tâches et sessions:', error);
      }
    };

    fetchTasksAndSessions();
  }, []);

  return (
    <PomodoroContext.Provider value={{ tasks, sessions, setTasks, setSessions }}>
      {children}
    </PomodoroContext.Provider>
  );
};
