import React, { useState, useEffect } from 'react';
import './TaskDetailsModal.css';

const TaskDetailsModal = ({ task, onClose }) => {
  const [visibleSessions, setVisibleSessions] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const sessionsPerPage = 15;

  useEffect(() => {
    if (task.sessions) {
      setVisibleSessions(task.sessions.slice(startIndex, startIndex + sessionsPerPage));
    }
  }, [task.sessions, startIndex]);

  const calculateDaysRemaining = () => {
    if (!task.date) return { text: "Pas de date", className: "no-date" };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.date);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: "En retard", className: "overdue" };
    if (diffDays === 0) return { text: "Aujourd'hui", className: "today" };
    if (diffDays === 1) return { text: "Demain", className: "tomorrow" };
    return { text: `${diffDays} jours restants`, className: "remaining" };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const calculateTotalTime = () => {
    if (!task.sessions) return 0;
    return task.sessions.reduce((acc, session) => acc + session.duration, 0);
  };

  const handleNextPage = () => {
    setStartIndex(prev => Math.min(prev + sessionsPerPage, task.sessions.length - sessionsPerPage));
  };

  const handlePreviousPage = () => {
    setStartIndex(prev => Math.max(prev - sessionsPerPage, 0));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Détails de la tâche</h3>
        <p><strong>Nom :</strong> {task.name}</p>
        <p>
          <strong>Échéance :</strong> {
            (() => {
              const daysRemaining = calculateDaysRemaining();
              return <span className={daysRemaining.className}>{daysRemaining.text}</span>;
            })()
          }
        </p>
        <p>
          <strong>Priorité :</strong> {task.priority === "low" ? "🟢 Faible" : task.priority === "medium" ? "🟠 Moyenne" : "🔴 Haute"}
        </p>
        <p><strong>Catégories :</strong> {task.categories ? task.categories.join(', ') : 'Aucune'}</p>
        <p><strong>Date de création :</strong> {task.addedAt ? formatDate(task.addedAt) : 'Inconnue'}</p>
        <p><strong>Temps total passé :</strong> {formatTime(calculateTotalTime())}</p>

        <h4>Sessions :</h4>
        {task.sessions && task.sessions.length > 0 ? (
          <>
            <ul>
              {visibleSessions.map((session, index) => (
                <li key={index}>
                  Date: {new Date(session.date).toLocaleString()}, Durée: {session.duration} minutes
                </li>
              ))}
            </ul>
            <div className="pagination-buttons">
              <button onClick={handlePreviousPage} disabled={startIndex === 0}>Précédent</button>
              <button onClick={handleNextPage} disabled={startIndex + sessionsPerPage >= task.sessions.length}>Suivant</button>
            </div>
          </>
        ) : (
          <p>Aucune session enregistrée pour cette tâche.</p>
        )}

        <button onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
};

export default TaskDetailsModal;