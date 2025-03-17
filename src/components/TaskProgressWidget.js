import React, { useState, useEffect } from 'react';
import BatteryIndicator from './BatteryIndicator';
import './TaskProgressWidget.css';

const TaskProgressWidget = ({ tasks }) => {
  const [closedTasksToday, setClosedTasksToday] = useState(0);

  useEffect(() => {
    // Filtrer les tâches terminées aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const closedToday = tasks.filter(task => {
      if (task.archived === "closed" && task.archivedAt) {
        const archivedDate = new Date(task.archivedAt);
        return archivedDate.toDateString() === today.toDateString();
      }
      return false;
    });

    setClosedTasksToday(closedToday.length);
  }, [tasks]);

  // Messages motivants en fonction du progrès
  const getMotivationalMessage = (level) => {
    if (level >= 5) return "Excellent travail ! Objectif atteint ! 🎯";
    if (level === 4) return "Presque là ! Un dernier effort ! 💪";
    if (level === 3) return "Bon progrès ! Continue comme ça ! 🚀";
    if (level === 2) return "C'est bien, continue ! 👍";
    if (level === 1) return "Bon début ! 👏";
    return "Commence ta journée ! 🌱";
  };

  return (
    <div className="task-progress-widget">
      <h3>Progression du jour</h3>
      <BatteryIndicator level={closedTasksToday} maxLevel={5} size="large" />
      <p className="motivational-message">{getMotivationalMessage(closedTasksToday)}</p>
    </div>
  );
};

export default TaskProgressWidget;
